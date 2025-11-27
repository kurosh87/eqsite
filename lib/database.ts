import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/app/schema/schema";
import { sql } from "drizzle-orm";
import { withTimeout, TIMEOUTS } from "./timeout-utils";

// Create database connection with optimized settings
// Note: fetchConnectionCache is now always enabled by default (no need to configure)
const connection = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    cache: 'no-store', // Disable HTTP caching for mutations to prevent stale data
  },
});

export const db = drizzle(connection, { schema });

let reportsAnalysisIdColumnCache: boolean | null = null;

async function ensureReportsAnalysisIdColumn(): Promise<boolean> {
  if (reportsAnalysisIdColumnCache !== null) {
    return reportsAnalysisIdColumnCache;
  }

  try {
    const result = await connection`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'reports'
          AND column_name = 'analysis_id'
      ) AS exists
    `;
    reportsAnalysisIdColumnCache = Boolean(result[0]?.exists);
  } catch (error) {
    console.error('Failed to check reports.analysis_id column:', error);
    reportsAnalysisIdColumnCache = false;
  }

  if (!reportsAnalysisIdColumnCache) {
    console.warn(
      '[reports] Missing analysis_id column. Run drizzle migration 0007 to link reports to analyses.'
    );
  }

  return reportsAnalysisIdColumnCache;
}

/**
 * Wraps database queries with timeout protection
 */
async function queryWithTimeout<T>(
  query: Promise<T>,
  queryName: string = 'database query'
): Promise<T> {
  return withTimeout(query, TIMEOUTS.DATABASE_QUERY, queryName);
}

export async function getPhenotypeIdsByNames(
  names: string[]
): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  regions: string[];
}>> {
  if (names.length === 0) {
    return [];
  }

  try {
    const namesParam = (sql as any).array(names, 'text');
    const result = await queryWithTimeout(
      connection`
        SELECT
          p.id,
          p.name,
          p.description,
          p.image_url as "imageUrl",
          ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions
        FROM phenotypes p
        LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
        WHERE p.name = ANY(${namesParam})
        GROUP BY p.id, p.name, p.description, p.image_url
      `,
      'getPhenotypeIdsByNames'
    );

    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.imageUrl,
      regions: row.regions || [],
    }));
  } catch (error) {
    console.error('Error fetching phenotype IDs by names:', error);
    throw error;
  }
}

/**
 * Database health check
 * Verifies connection and basic functionality
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    await queryWithTimeout(
      connection`SELECT 1 as status`,
      'health check'
    );
    const latency = Date.now() - startTime;
    return { healthy: true, latency };
  } catch (error: any) {
    console.error('Database health check failed:', error);
    return { healthy: false, error: error.message };
  }
}

export interface PhenotypeMatch {
  id: string;
  name: string;
  description: string | null;
  regions: string[];
  imageUrl: string;
  similarity: number;
  connectionScore?: number;
  parentGroups?: string[];
  llmConfidence?: number;
  llmReasoning?: string;
  llmGroups?: string[];
  llmProvider?: string;
  llmAnalysis?: string;
  llmPrimaryRegion?: string;
  llmMatchRank?: number;
  llmCostEstimate?: number;
}

export interface PhenotypeDetail {
  id: string;
  name: string;
  description: string | null;
  regions: string[];
  countries: string[];
  imageUrl: string;
  metadata: any;
  connectionScore: number;
  parentGroups: string[];
  isBasic: boolean;
  relatedPhenotypes?: RelatedPhenotype[];
}

export interface RelatedPhenotype {
  id: string;
  name: string;
  imageUrl: string;
  relationType: string;
  strength: number;
}

/**
 * Find similar phenotypes using HIERARCHICAL matching
 * Step 1: Match to base phenotypes (is_basic = true)
 * Step 2: Get children of top base matches
 * Step 3: Match to those specific children
 * OPTIMIZED: Reduces search space and provides better results
 */
export async function findSimilarPhenotypesHierarchical(
  embedding: number[],
  finalLimit: number = 10
): Promise<PhenotypeMatch[]> {
  try {
    const embeddingString = `[${embedding.join(",")}]`;


    // Step 1: Find top 3 base phenotypes
    const baseResults = await queryWithTimeout(
      connection`
        SELECT
          p.id,
          p.name,
          p.description,
          p.image_url as "imageUrl",
          p.metadata,
          ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions,
          1 - (p.embedding <=> ${embeddingString}::vector) as similarity
        FROM phenotypes p
        LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
        WHERE p.embedding IS NOT NULL
          AND p.metadata->>'is_basic' = 'true'
        GROUP BY p.id, p.name, p.description, p.image_url, p.metadata, p.embedding
        ORDER BY p.embedding <=> ${embeddingString}::vector ASC
        LIMIT 3
      `,
      'findSimilarPhenotypesHierarchical:base'
    );

    if (baseResults.length === 0) {
      console.warn("⚠️  No base phenotype matches found, falling back to all phenotypes");
      return findSimilarPhenotypes(embedding, finalLimit);
    }

    const basePhenotypes = baseResults.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      regions: row.regions || [],
      imageUrl: row.imageUrl,
      similarity: parseFloat(row.similarity),
      connectionScore: row.metadata?.connection_score || 0,
      parentGroups: row.metadata?.parent_groups || [],
    }));


    // Step 2: Get children of top base phenotypes
    const baseIds = baseResults.map((r: any) => r.id);
    const baseIdsArray = `{${baseIds.join(",")}}`;


    const childrenIds = await queryWithTimeout(
      connection`
        SELECT DISTINCT child_id
        FROM phenotype_hierarchy
        WHERE parent_id = ANY(${baseIdsArray}::uuid[])
      `,
      'findSimilarPhenotypesHierarchical:children'
    );

    if (childrenIds.length === 0) {
      return basePhenotypes.slice(0, finalLimit);
    }

    const childIds = childrenIds.map((row: any) => row.child_id);
    const childIdsArray = `{${childIds.join(",")}}`;


    // Step 3: Match against children phenotypes
    const childResults = await queryWithTimeout(
      connection`
        SELECT
          p.id,
          p.name,
          p.description,
          p.image_url as "imageUrl",
          p.metadata,
          ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions,
          1 - (p.embedding <=> ${embeddingString}::vector) as similarity
        FROM phenotypes p
        LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
        WHERE p.embedding IS NOT NULL
          AND p.id = ANY(${childIdsArray}::uuid[])
        GROUP BY p.id, p.name, p.description, p.image_url, p.metadata, p.embedding
        ORDER BY p.embedding <=> ${embeddingString}::vector ASC
        LIMIT ${finalLimit}
      `,
      'findSimilarPhenotypesHierarchical:final'
    );

    const childPhenotypes = childResults.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      regions: row.regions || [],
      imageUrl: row.imageUrl,
      similarity: parseFloat(row.similarity),
      connectionScore: row.metadata?.connection_score || 0,
      parentGroups: row.metadata?.parent_groups || [],
    }));


    // If we don't have enough children, pad with base phenotypes
    if (childPhenotypes.length < finalLimit) {
      const remaining = finalLimit - childPhenotypes.length;
      const paddedResults = [...childPhenotypes, ...basePhenotypes.slice(0, remaining)];
      return paddedResults.slice(0, finalLimit);
    }

    return childPhenotypes;
  } catch (error) {
    console.error("Error in hierarchical phenotype matching:", error);
    return findSimilarPhenotypes(embedding, finalLimit);
  }
}

/**
 * Find similar phenotypes using vector similarity search
 * OPTIMIZED: Now includes geographic data and connection scores
 */
export async function findSimilarPhenotypes(
  embedding: number[],
  limit: number = 10
): Promise<PhenotypeMatch[]> {
  try {
    const embeddingString = `[${embedding.join(",")}]`;

    const results = await queryWithTimeout(
      connection`
        SELECT
          p.id,
          p.name,
          p.description,
          p.image_url as "imageUrl",
          p.metadata,
          ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions,
          1 - (p.embedding <=> ${embeddingString}::vector) as similarity
        FROM phenotypes p
        LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
        WHERE p.embedding IS NOT NULL
        GROUP BY p.id, p.name, p.description, p.image_url, p.metadata, p.embedding
        ORDER BY p.embedding <=> ${embeddingString}::vector ASC
        LIMIT ${limit}
      `,
      'findSimilarPhenotypes'
    );

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      regions: row.regions || [],
      imageUrl: row.imageUrl,
      similarity: parseFloat(row.similarity),
      connectionScore: row.metadata?.connection_score || 0,
      parentGroups: row.metadata?.parent_groups || [],
    }));
  } catch (error) {
    console.error("Error finding similar phenotypes:", error);
    throw new Error(`Database query failed: ${error}`);
  }
}

/**
 * Get all phenotypes with geographic and connection data
 * OPTIMIZED: Uses LEFT JOIN for geographic tags
 */
export async function getAllPhenotypes() {
  try {
    const results = await connection`
      SELECT
        p.id,
        p.name,
        p.description,
        p.image_url as "imageUrl",
        p.metadata,
        p.created_at as "createdAt",
        ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions
      FROM phenotypes p
      LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
      GROUP BY p.id, p.name, p.description, p.image_url, p.metadata, p.created_at
      ORDER BY p.name ASC
    `;

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.imageUrl,
      regions: row.regions || [],
      connectionScore: row.metadata?.connection_score || 0,
      isBasic: row.metadata?.is_basic || false,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error("Error fetching all phenotypes:", error);
    throw error;
  }
}

/**
 * Get phenotype by ID with full details
 * OPTIMIZED: Includes geographic tags, connection scores, and related phenotypes
 */
export async function getPhenotypeById(id: string): Promise<PhenotypeDetail | null> {
  try {
    const results = await connection`
      SELECT
        p.id,
        p.name,
        p.description,
        p.image_url as "imageUrl",
        p.metadata,
        ARRAY_AGG(DISTINCT gt.region ORDER BY gt.confidence DESC)
          FILTER (WHERE gt.region IS NOT NULL) as regions,
        ARRAY_AGG(DISTINCT gt.country ORDER BY gt.confidence DESC)
          FILTER (WHERE gt.country IS NOT NULL) as countries
      FROM phenotypes p
      LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
      WHERE p.id = ${id}
      GROUP BY p.id, p.name, p.description, p.image_url, p.metadata
    `;

    if (results.length === 0) return null;

    const row = results[0];

    // Get related phenotypes from hierarchy
    const related = await getRelatedPhenotypes(id);

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      regions: row.regions || [],
      countries: row.countries || [],
      imageUrl: row.imageUrl,
      metadata: row.metadata || {},
      connectionScore: row.metadata?.connection_score || 0,
      parentGroups: row.metadata?.parent_groups || [],
      isBasic: row.metadata?.is_basic || false,
      relatedPhenotypes: related,
    };
  } catch (error) {
    console.error("Error fetching phenotype by ID:", error);
    return null;
  }
}

/**
 * Get related phenotypes using phenotype_hierarchy table
 * NEW FEATURE: Leverages hierarchical relationships
 */
export async function getRelatedPhenotypes(phenotypeId: string): Promise<RelatedPhenotype[]> {
  try {
    const results = await connection`
      SELECT
        p.id,
        p.name,
        p.image_url as "imageUrl",
        ph.relationship_type as "relationType",
        ph.strength
      FROM phenotype_hierarchy ph
      JOIN phenotypes p ON ph.child_id = p.id
      WHERE ph.parent_id = ${phenotypeId}
      ORDER BY ph.strength DESC, p.name ASC
      LIMIT 20
    `;

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      imageUrl: row.imageUrl,
      relationType: row.relationType,
      strength: parseFloat(row.strength),
    }));
  } catch (error) {
    console.error("Error fetching related phenotypes:", error);
    return [];
  }
}

/**
 * Get top connected phenotypes from materialized view
 * NEW FEATURE: Uses pre-computed connection scores
 */
export async function getTopConnectedPhenotypes(limit: number = 20) {
  try {
    const results = await connection`
      SELECT
        phenotype_id as id,
        phenotype_name as name,
        image_url as "imageUrl",
        connection_score as "connectionScore",
        similar_count as "similarCount",
        related_count as "relatedCount",
        is_basic as "isBasic"
      FROM mv_phenotype_network
      ORDER BY connection_score DESC
      LIMIT ${limit}
    `;

    return results;
  } catch (error) {
    console.error("Error fetching top connected phenotypes:", error);
    // Fallback to regular query if materialized view doesn't exist
    return [];
  }
}

/**
 * Get phenotypes by region using geographic_tags
 * NEW FEATURE: Regional filtering with confidence scoring
 */
export async function getPhenotypesByRegion(region: string) {
  try {
    // Try materialized views first for better performance
    const viewMap: Record<string, string> = {
      'Africa': 'mv_african_phenotypes',
      'Europe': 'mv_european_phenotypes',
      'Asia': 'mv_asian_phenotypes',
    };

    if (viewMap[region]) {
      const results = await connection`
        SELECT
          phenotype_id as id,
          phenotype_name as name,
          image_url as "imageUrl",
          description,
          regions
        FROM ${sql.raw(viewMap[region])}
        ORDER BY phenotype_name ASC
      `;
      return results;
    }

    // Fallback to regular query for other regions
    const results = await connection`
      SELECT DISTINCT
        p.id,
        p.name,
        p.image_url as "imageUrl",
        p.description,
        ARRAY_AGG(DISTINCT gt.region) as regions
      FROM phenotypes p
      JOIN geographic_tags gt ON p.id = gt.phenotype_id
      WHERE gt.region = ${region}
      GROUP BY p.id, p.name, p.image_url, p.description
      ORDER BY p.name ASC
    `;

    return results;
  } catch (error) {
    console.error("Error fetching phenotypes by region:", error);
    return [];
  }
}

/**
 * Full-text search using PostgreSQL search_vector
 * NEW FEATURE: Ranked search results
 */
export async function searchPhenotypes(searchTerm: string, limit: number = 20) {
  try {
    const results = await connection`
      SELECT
        p.id,
        p.name,
        p.description,
        p.image_url as "imageUrl",
        p.metadata,
        ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions,
        ts_rank(p.search_vector, plainto_tsquery('english', ${searchTerm})) as rank
      FROM phenotypes p
      LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
      WHERE p.search_vector @@ plainto_tsquery('english', ${searchTerm})
      GROUP BY p.id, p.name, p.description, p.image_url, p.metadata, p.search_vector
      ORDER BY rank DESC, p.name ASC
      LIMIT ${limit}
    `;

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.imageUrl,
      regions: row.regions || [],
      rank: parseFloat(row.rank),
      connectionScore: row.metadata?.connection_score || 0,
    }));
  } catch (error) {
    console.error("Error searching phenotypes:", error);
    // Fallback to ILIKE search
    const results = await connection`
      SELECT
        p.id,
        p.name,
        p.description,
        p.image_url as "imageUrl",
        ARRAY_AGG(DISTINCT gt.region) as regions
      FROM phenotypes p
      LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
      WHERE p.name ILIKE ${'%' + searchTerm + '%'}
         OR p.description ILIKE ${'%' + searchTerm + '%'}
      GROUP BY p.id, p.name, p.description, p.image_url
      ORDER BY p.name ASC
      LIMIT ${limit}
    `;
    return results;
  }
}

/**
 * Get all available regions with phenotype counts
 * NEW FEATURE: Region statistics
 */
export async function getRegionsWithCounts() {
  try {
    const results = await connection`
      SELECT
        region,
        COUNT(DISTINCT phenotype_id) as count
      FROM geographic_tags
      GROUP BY region
      ORDER BY count DESC
    `;

    return results.map((row: any) => ({
      region: row.region,
      count: parseInt(row.count),
    }));
  } catch (error) {
    console.error("Error fetching regions:", error);
    return [];
  }
}

/**
 * Get phenotype hierarchy tree
 * NEW FEATURE: Recursive tree traversal
 */
export async function getPhenotypeTree(rootName: string) {
  try {
    const results = await connection`
      SELECT * FROM get_phenotype_tree(${rootName})
    `;
    return results;
  } catch (error) {
    console.error("Error fetching phenotype tree:", error);
    return [];
  }
}

/**
 * Fetch base phenotypes (metadata.is_basic = true)
 */
export async function getBasePhenotypes(): Promise<Array<{
  id: string;
  name: string;
  description: string | null;
  regions: string[];
  imageUrl: string;
  metadata: any;
}>> {
  try {
    const rows = await queryWithTimeout(
      connection`
        SELECT
          p.id,
          p.name,
          p.description,
          p.image_url as "imageUrl",
          p.metadata,
          ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions
        FROM phenotypes p
        LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
        WHERE p.metadata->>'is_basic' = 'true'
        GROUP BY p.id, p.name, p.description, p.image_url, p.metadata
        ORDER BY p.name
      `,
      'getBasePhenotypes'
    );

    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      regions: row.regions || [],
      imageUrl: row.imageUrl,
      metadata: row.metadata,
    }));
  } catch (error) {
    console.error("Error fetching base phenotypes:", error);
    return [];
  }
}

/**
 * Get all child phenotype IDs for a list of base phenotypes
 */
export async function getChildPhenotypeIds(baseIds: string[]): Promise<string[]> {
  if (!baseIds || baseIds.length === 0) return [];

  try {
    const baseIdsArray = `{${baseIds.join(",")}}`;
    const rows = await queryWithTimeout(
      connection`
        SELECT DISTINCT child_id
        FROM phenotype_hierarchy
        WHERE parent_id = ANY(${baseIdsArray}::uuid[])
      `,
      'getChildPhenotypeIds'
    );
    return rows.map((row: any) => row.child_id);
  } catch (error) {
    console.error("Error fetching child phenotypes:", error);
    return [];
  }
}

/**
 * Find similar phenotypes constrained to a specific ID list
 */
export async function findSimilarPhenotypesByIds(
  embedding: number[],
  allowedIds: string[],
  limit: number = 10
): Promise<PhenotypeMatch[]> {
  if (!allowedIds || allowedIds.length === 0) {
    return [];
  }

  const embeddingString = `[${embedding.join(",")}]`;
  const allowedArray = `{${allowedIds.join(",")}}`;

  try {
    const results = await queryWithTimeout(
      connection`
        SELECT
          p.id,
          p.name,
          p.description,
          p.image_url as "imageUrl",
          p.metadata,
          ARRAY_AGG(DISTINCT gt.region) FILTER (WHERE gt.region IS NOT NULL) as regions,
          1 - (p.embedding <=> ${embeddingString}::vector) as similarity
        FROM phenotypes p
        LEFT JOIN geographic_tags gt ON p.id = gt.phenotype_id
        WHERE p.embedding IS NOT NULL
          AND p.id = ANY(${allowedArray}::uuid[])
        GROUP BY p.id, p.name, p.description, p.image_url, p.metadata, p.embedding
        ORDER BY p.embedding <=> ${embeddingString}::vector ASC
        LIMIT ${limit}
      `,
      'findSimilarPhenotypesByIds'
    );

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      regions: row.regions || [],
      imageUrl: row.imageUrl,
      similarity: parseFloat(row.similarity),
      connectionScore: row.metadata?.connection_score || 0,
      parentGroups: row.metadata?.parent_groups || [],
    }));
  } catch (error) {
    console.error("Error in findSimilarPhenotypesByIds:", error);
    return [];
  }
}

// ============================================
// EXISTING FUNCTIONS (kept for compatibility)
// ============================================

export async function saveUserUpload(
  userId: string,
  imageUrl: string,
  embedding: number[] | null
) {
  if (embedding) {
    // Deep learning embedding path (InsightFace)
    const embeddingString = `[${embedding.join(",")}]`;
    const result = await connection`
      INSERT INTO user_uploads (user_id, image_url, embedding, created_at)
      VALUES (${userId}, ${imageUrl}, ${embeddingString}::vector, NOW())
      RETURNING id
    `;
    return result[0].id;
  } else {
    // Anthropometric path (no embedding, uses measurements instead)
    const result = await connection`
      INSERT INTO user_uploads (user_id, image_url, embedding, created_at)
      VALUES (${userId}, ${imageUrl}, NULL, NOW())
      RETURNING id
    `;
    return result[0].id;
  }
}

export async function saveAnalysisHistory(
  userId: string,
  uploadId: string,
  topMatches: PhenotypeMatch[],
  aiReport: string
) {
  const matchesJson = JSON.stringify(
    topMatches.map((m) => ({
      phenotypeId: m.id,
      phenotypeName: m.name,
      similarity: m.similarity,
      imageUrl: m.imageUrl,
      regions: m.regions || [],
      parentGroups: m.parentGroups || [],
      embeddingSimilarity: (m as any).embeddingSimilarity ?? null,
      measurementSimilarity: (m as any).measurementSimilarity ?? null,
      hybridScore: (m as any).hybridScore ?? null,
      adjustedSimilarity: (m as any).adjustedSimilarity ?? null,
      confidence: (m as any).confidence ?? null,
      llmConfidence: (m as any).llmConfidence ?? null,
      llmReasoning: (m as any).llmReasoning ?? null,
      llmGroups: (m as any).llmGroups ?? [],
      llmProvider: (m as any).llmProvider ?? null,
      llmAnalysis: (m as any).llmAnalysis ?? null,
      llmPrimaryRegion: (m as any).llmPrimaryRegion ?? null,
      llmMatchRank: (m as any).llmMatchRank ?? null,
      llmCostEstimate: (m as any).llmCostEstimate ?? null,
    }))
  );

  const result = await connection`
    INSERT INTO analysis_history (user_id, upload_id, top_matches, ai_report, created_at)
    VALUES (${userId}, ${uploadId}, ${matchesJson}::jsonb, ${aiReport}, NOW())
    RETURNING id
  `;

  return result[0].id;
}

export async function getUserAnalysisHistory(userId: string, limit: number = 20) {
  return await connection`
    SELECT
      ah.id,
      ah.created_at as "createdAt",
      ah.top_matches as "topMatches",
      ah.ai_report as "aiReport",
      uu.image_url as "uploadImageUrl"
    FROM analysis_history ah
    JOIN user_uploads uu ON ah.upload_id = uu.id
    WHERE ah.user_id = ${userId}
    ORDER BY ah.created_at DESC
    LIMIT ${limit}
  `;
}

export async function getAnalysisById(analysisId: string, userId: string) {
  const result = await connection`
    SELECT
      ah.id,
      ah.created_at as "createdAt",
      ah.top_matches as "topMatches",
      ah.ai_report as "aiReport",
      uu.image_url as "uploadImageUrl"
    FROM analysis_history ah
    JOIN user_uploads uu ON ah.upload_id = uu.id
    WHERE ah.id = ${analysisId} AND ah.user_id = ${userId}
  `;

  return result[0] || null;
}

// ============================================
// PREMIUM REPORT FUNCTIONS
// ============================================

/**
 * Create a new report
 */
export async function createReport(
  userId: string,
  uploadId: string,
  analysisId: string,
  primaryPhenotypeId: string,
  secondaryPhenotypes: Array<{ id: string; name: string; similarity: number }>
) {
  const hasAnalysisIdColumn = await ensureReportsAnalysisIdColumn();

  const insertQuery = hasAnalysisIdColumn
    ? connection`
        INSERT INTO reports (
          user_id,
          upload_id,
          analysis_id,
          primary_phenotype_id,
          secondary_phenotypes,
          status,
          generated_at
        )
        VALUES (
          ${userId},
          ${uploadId},
          ${analysisId},
          ${primaryPhenotypeId},
          ${JSON.stringify(secondaryPhenotypes)}::jsonb,
          'preview',
          NOW()
        )
        RETURNING id
      `
    : connection`
        INSERT INTO reports (
          user_id,
          upload_id,
          primary_phenotype_id,
          secondary_phenotypes,
          status,
          generated_at
        )
        VALUES (
          ${userId},
          ${uploadId},
          ${primaryPhenotypeId},
          ${JSON.stringify(secondaryPhenotypes)}::jsonb,
          'preview',
          NOW()
        )
        RETURNING id
      `;

  const result = await insertQuery;
  return result[0]?.id;
}

/**
 * Get report by ID
 */
export async function getReportById(reportId: string, userId: string) {
  const hasAnalysisIdColumn = await ensureReportsAnalysisIdColumn();

  const query = hasAnalysisIdColumn
    ? connection`
        SELECT
          r.id,
          r.user_id as "userId",
          r.upload_id as "uploadId",
          r.analysis_id as "analysisId",
          r.primary_phenotype_id as "primaryPhenotypeId",
          r.secondary_phenotypes as "secondaryPhenotypes",
          r.status,
          r.payment_id as "paymentId",
          r.amount_paid as "amountPaid",
          r.generated_at as "generatedAt",
          r.accessed_count as "accessedCount",
          r.last_accessed as "lastAccessed",
          uu.image_url as "uploadImageUrl",
          p.name as "primaryPhenotypeName",
          p.image_url as "primaryPhenotypeImageUrl",
          p.description as "primaryPhenotypeDescription"
        FROM reports r
        JOIN user_uploads uu ON r.upload_id = uu.id
        JOIN phenotypes p ON r.primary_phenotype_id = p.id
        WHERE r.id = ${reportId} AND r.user_id = ${userId}
      `
    : connection`
        SELECT
          r.id,
          r.user_id as "userId",
          r.upload_id as "uploadId",
          r.primary_phenotype_id as "primaryPhenotypeId",
          r.secondary_phenotypes as "secondaryPhenotypes",
          r.status,
          r.payment_id as "paymentId",
          r.amount_paid as "amountPaid",
          r.generated_at as "generatedAt",
          r.accessed_count as "accessedCount",
          r.last_accessed as "lastAccessed",
          uu.image_url as "uploadImageUrl",
          p.name as "primaryPhenotypeName",
          p.image_url as "primaryPhenotypeImageUrl",
          p.description as "primaryPhenotypeDescription"
        FROM reports r
        JOIN user_uploads uu ON r.upload_id = uu.id
        JOIN phenotypes p ON r.primary_phenotype_id = p.id
        WHERE r.id = ${reportId} AND r.user_id = ${userId}
      `;

  const result = await query;
  return result[0] || null;
}

/**
 * Get report by originating analysis ID
 */
export async function getReportByAnalysisId(
  analysisId: string,
  userId: string
) {
  const hasAnalysisIdColumn = await ensureReportsAnalysisIdColumn();

  if (!hasAnalysisIdColumn) {
    return null;
  }

  const result = await connection`
    SELECT
      r.id,
      r.user_id as "userId",
      r.upload_id as "uploadId",
      r.analysis_id as "analysisId",
      r.primary_phenotype_id as "primaryPhenotypeId",
      r.secondary_phenotypes as "secondaryPhenotypes",
      r.status,
      r.payment_id as "paymentId",
      r.amount_paid as "amountPaid",
      r.generated_at as "generatedAt",
      r.accessed_count as "accessedCount",
      r.last_accessed as "lastAccessed",
      uu.image_url as "uploadImageUrl",
      p.name as "primaryPhenotypeName",
      p.image_url as "primaryPhenotypeImageUrl",
      p.description as "primaryPhenotypeDescription"
    FROM reports r
    JOIN user_uploads uu ON r.upload_id = uu.id
    JOIN phenotypes p ON r.primary_phenotype_id = p.id
    WHERE r.analysis_id = ${analysisId} AND r.user_id = ${userId}
  `;

  return result[0] || null;
}

/**
 * Update report status to 'paid'
 */
export async function markReportAsPaid(
  reportId: string,
  paymentId: string,
  amountPaid: number
) {
  await connection`
    UPDATE reports
    SET
      status = 'paid',
      payment_id = ${paymentId},
      amount_paid = ${amountPaid}
    WHERE id = ${reportId}
  `;
}

/**
 * Increment report access count
 */
export async function incrementReportAccess(reportId: string) {
  await connection`
    UPDATE reports
    SET
      accessed_count = COALESCE(accessed_count, 0) + 1,
      last_accessed = NOW()
    WHERE id = ${reportId}
  `;
}

/**
 * Create payment record
 */
export async function createPayment(
  userId: string,
  reportId: string,
  amount: number,
  currency: string = "usd",
  stripePaymentIntentId?: string
) {
  const result = await connection`
    INSERT INTO payments (
      user_id,
      report_id,
      stripe_payment_intent_id,
      amount,
      currency,
      status,
      created_at
    )
    VALUES (
      ${userId},
      ${reportId},
      ${stripePaymentIntentId || null},
      ${amount},
      ${currency},
      'pending',
      NOW()
    )
    RETURNING id
  `;

  return result[0].id;
}

/**
 * Get user's reports
 */
export async function getUserReports(userId: string, limit: number = 20) {
  return await connection`
    SELECT
      r.id,
      r.status,
      r.generated_at as "generatedAt",
      r.analysis_id as "analysisId",
      r.primary_phenotype_id as "primaryPhenotypeId",
      p.name as "primaryPhenotypeName",
      p.image_url as "primaryPhenotypeImageUrl",
      uu.image_url as "uploadImageUrl"
    FROM reports r
    JOIN phenotypes p ON r.primary_phenotype_id = p.id
    JOIN user_uploads uu ON r.upload_id = uu.id
    WHERE r.user_id = ${userId}
    ORDER BY r.generated_at DESC
    LIMIT ${limit}
  `;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  stripePaymentIntentId?: string
) {
  await connection`
    UPDATE payments
    SET
      status = ${status},
      stripe_payment_intent_id = COALESCE(${stripePaymentIntentId || null}, stripe_payment_intent_id)
    WHERE id = ${paymentId}
  `;
}

/**
 * Get payment by Stripe Payment Intent ID
 */
export async function getPaymentByStripeId(stripePaymentIntentId: string) {
  const result = await connection`
    SELECT
      id,
      user_id as "userId",
      report_id as "reportId",
      stripe_payment_intent_id as "stripePaymentIntentId",
      amount,
      currency,
      status,
      created_at as "createdAt",
      metadata
    FROM payments
    WHERE stripe_payment_intent_id = ${stripePaymentIntentId}
  `;

  return result[0] || null;
}
