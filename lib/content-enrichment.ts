/**
 * Content Enrichment System
 * Generates detailed, educational content for phenotypes using AI
 */

import OpenAI from "openai";
import { neon } from "@neondatabase/serverless";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const connection = neon(process.env.DATABASE_URL!);

export interface PhenotypeContent {
  phenotypeId: string;
  contentType: string;
  title: string;
  content: string;
  citations?: Array<{ text: string; url?: string }>;
  mediaUrls?: Array<{ url: string; caption?: string }>;
}

/**
 * Generate comprehensive content for a phenotype
 * Creates multiple sections: overview, history, geography, genetics, culture
 */
export async function enrichPhenotypeContent(
  phenotypeId: string,
  phenotypeName: string,
  existingDescription?: string
): Promise<PhenotypeContent[]> {
  const sections: PhenotypeContent[] = [];

  try {
    // Generate Overview
    sections.push(
      await generateContentSection(
        phenotypeId,
        phenotypeName,
        'overview',
        'Overview & Characteristics',
        `Write a comprehensive 300-400 word overview of the ${phenotypeName} phenotype including:
        - Physical characteristics (facial features, build, etc.)
        - Key identifying traits
        - Variations within the phenotype
        - Common distinguishing features

        ${existingDescription ? `Existing description: ${existingDescription}` : ''}

        Use professional, educational language.`
      )
    );

    // Generate Historical Context
    sections.push(
      await generateContentSection(
        phenotypeId,
        phenotypeName,
        'historical',
        'Historical Context',
        `Write a 250-350 word section about the historical context of the ${phenotypeName} phenotype:
        - When and how it was first documented
        - Historical populations associated with it
        - Evolution of the classification
        - Notable historical figures (if applicable)
        - Archaeological and historical evidence

        Be historically accurate and cite sources when possible.`
      )
    );

    // Generate Geographic Distribution
    sections.push(
      await generateContentSection(
        phenotypeId,
        phenotypeName,
        'geographic',
        'Geographic Distribution',
        `Write a 200-300 word section about the geographic distribution of ${phenotypeName}:
        - Primary regions and countries
        - Historical distribution patterns
        - Modern populations
        - Environmental factors that shaped these characteristics
        - Migration patterns

        Include specific geographic details.`
      )
    );

    // Generate Genetic Information
    sections.push(
      await generateContentSection(
        phenotypeId,
        phenotypeName,
        'genetic',
        'Genetic Factors',
        `Write a 200-300 word section about genetic factors related to ${phenotypeName}:
        - Key genetic influences on phenotypic traits
        - Hereditary patterns
        - Population genetics
        - Admixture and gene flow
        - Modern genetic research findings

        Be scientifically accurate. Cite genetic studies when possible.`
      )
    );

    // Generate Cultural Context
    sections.push(
      await generateContentSection(
        phenotypeId,
        phenotypeName,
        'cultural',
        'Cultural Context',
        `Write a 200-250 word section about cultural aspects related to populations showing ${phenotypeName} characteristics:
        - Cultural diversity within these populations
        - Notable cultural contributions
        - Modern cultural identity
        - Avoiding stereotyping
        - Celebrating diversity

        Use respectful, inclusive language.`
      )
    );

    return sections;
  } catch (error) {
    console.error("Content enrichment error:", error);
    return [];
  }
}

/**
 * Generate a single content section using AI
 */
async function generateContentSection(
  phenotypeId: string,
  phenotypeName: string,
  contentType: string,
  title: string,
  prompt: string
): Promise<PhenotypeContent> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role: "system",
        content: "You are an expert anthropologist and educator writing comprehensive, factual content about human phenotypic variation. Be scientific, educational, and respectful of human diversity."
      }, {
        role: "user",
        content: prompt
      }],
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || '';

    return {
      phenotypeId,
      contentType,
      title,
      content,
      citations: generateCitations(contentType),
    };
  } catch (error) {
    console.error(`Error generating ${contentType} content:`, error);
    return {
      phenotypeId,
      contentType,
      title,
      content: `Content for ${title} is being generated. Please check back later.`,
    };
  }
}

/**
 * Generate appropriate citations based on content type
 */
function generateCitations(contentType: string): Array<{ text: string; url?: string }> {
  const citationMap: Record<string, Array<{ text: string; url?: string }>> = {
    overview: [
      { text: "Anthropometry and Human Variation", url: "https://en.wikipedia.org/wiki/Anthropometry" },
    ],
    historical: [
      { text: "Historical Anthropology", url: "https://en.wikipedia.org/wiki/Historical_race_concepts" },
    ],
    geographic: [
      { text: "Human Geographic Variation", url: "https://en.wikipedia.org/wiki/Human_genetic_variation" },
    ],
    genetic: [
      { text: "Population Genetics", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5299519/" },
      { text: "Genetic Basis of Facial Morphology", url: "https://www.nature.com/articles/ng.3211" },
    ],
    cultural: [
      { text: "Cultural Anthropology", url: "https://en.wikipedia.org/wiki/Cultural_anthropology" },
    ],
  };

  return citationMap[contentType] || [];
}

/**
 * Save enriched content to database
 */
export async function saveEnrichedContent(sections: PhenotypeContent[]): Promise<void> {
  for (const section of sections) {
    try {
      await connection`
        INSERT INTO phenotype_content (
          phenotype_id,
          content_type,
          title,
          content,
          metadata,
          citations,
          created_at
        )
        VALUES (
          ${section.phenotypeId},
          ${section.contentType},
          ${section.title},
          ${section.content},
          null,
          ${JSON.stringify(section.citations)}::jsonb,
          NOW()
        )
        ON CONFLICT (phenotype_id, content_type) DO UPDATE SET
          content = EXCLUDED.content,
          citations = EXCLUDED.citations,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error(`Error saving ${section.contentType} content:`, error);
    }
  }
}

/**
 * Batch enrich top N phenotypes
 */
export async function batchEnrichPhenotypes(limit: number = 20): Promise<{
  enriched: number;
  failed: number;
  phenotypes: string[];
}> {
  const enriched: string[] = [];
  let failedCount = 0;

  try {
    // Get top phenotypes without content
    const phenotypes = await connection`
      SELECT DISTINCT p.id, p.name, p.description
      FROM phenotypes p
      LEFT JOIN phenotype_content pc ON p.id = pc.phenotype_id
      WHERE pc.id IS NULL
      ORDER BY p.name
      LIMIT ${limit}
    `;

    console.log(`📝 Enriching ${phenotypes.length} phenotypes...`);

    for (const phenotype of phenotypes) {
      try {
        console.log(`Enriching: ${phenotype.name}`);

        const sections = await enrichPhenotypeContent(
          phenotype.id,
          phenotype.name,
          phenotype.description
        );

        await saveEnrichedContent(sections);

        enriched.push(phenotype.name);
        console.log(`✅ ${phenotype.name} enriched`);

        // Rate limit: Wait 2 seconds between requests to avoid API limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to enrich ${phenotype.name}:`, error);
        failedCount++;
      }
    }

    return {
      enriched: enriched.length,
      failed: failedCount,
      phenotypes: enriched,
    };
  } catch (error) {
    console.error("Batch enrichment error:", error);
    throw error;
  }
}
