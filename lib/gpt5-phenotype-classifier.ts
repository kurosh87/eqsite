/**
 * GPT-5 Vision-based Phenotype Classifier
 * Direct classification using vision - NO fake embeddings!
 */

import OpenAI from "openai";
import { db } from "./database";
import { sql } from "drizzle-orm";
import { withTimeout, TIMEOUTS } from "./timeout-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CLASSIFIER_MODEL = "gpt-5";

interface PhenotypeMatch {
  id: string;
  name: string;
  description: string | null;
  regions: string[];
  geographicOrigin: string | null;
  similarity: number;
  connectionScore: number;
  parentGroups: string[];
}

/**
 * Use GPT-5 vision to directly classify phenotype from image
 * Returns actual matches based on visual analysis, not fake embeddings
 */
export async function classifyPhenotypeWithGPT5(
  imageUrl: string,
  topK: number = 10
): Promise<PhenotypeMatch[]> {
  console.log("🔍 Fetching all phenotypes from database...");

  // Get all phenotypes with geographic tags
  const phenotypes = await db.execute(sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.geographic_origin as "geographicOrigin",
      p.metadata,
      COALESCE(
        (SELECT array_agg(DISTINCT gt.region)
         FROM geographic_tags gt
         WHERE gt.phenotype_id = p.id),
        ARRAY[]::text[]
      ) as regions
    FROM phenotypes p
    ORDER BY p.name
  `);

  console.log(`✅ Found ${phenotypes.rows.length} phenotypes in database`);

  // Create compact list for GPT-5 (keep it short for speed)
  const phenotypeList = phenotypes.rows
    .map((p: any, idx: number) => {
      const regions = p.regions?.length ? ` (${p.regions.slice(0, 3).join(", ")})` : "";
      return `${idx + 1}. ${p.name}${regions}`;
    })
    .join("\n");

  const prompt = `Looking at this portrait, what cultural or ethnic groups does the person resemble?

Here are ${phenotypes.rows.length} reference groups to choose from:
${phenotypeList}

Just tell me which groups from the list above match this person best. Give me your top ${topK} matches.

Return as JSON:
{
  "matches": [
    {"name": "GroupName", "confidence": 85, "reasoning": "Why this matches"},
    {"name": "GroupName", "confidence": 70, "reasoning": "Why this matches"}
  ]
}

Use exact names from the list above.`;

  console.log("🤖 Calling GPT-5 vision for phenotype classification...");

  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: CLASSIFIER_MODEL,
        reasoning_effort: "low", // Use low reasoning for speed
        max_completion_tokens: 1000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
            ],
          },
        ],
      } as any),
      90000, // 90 second timeout for large prompt
      "GPT-5 phenotype classification"
    );

    const content = completion.choices[0]?.message?.content;
    console.log("📝 Raw GPT-5 response:", content?.substring(0, 500));

    if (!content) {
      throw new Error("No response from GPT-5");
    }

    // Parse response
    let gpt5Matches: Array<{ name: string; confidence: number; reasoning: string }>;
    try {
      const parsed = JSON.parse(content);
      console.log("📊 Parsed GPT-5 response:", JSON.stringify(parsed).substring(0, 300));
      // Handle both array and object with array
      gpt5Matches = Array.isArray(parsed) ? parsed : parsed.matches || [];
    } catch (e) {
      console.error("❌ Failed to parse GPT-5 response:", content);
      throw new Error("Invalid JSON response from GPT-5");
    }

    console.log(`✅ GPT-5 classified ${gpt5Matches.length} phenotype matches`);
    if (gpt5Matches.length > 0) {
      console.log("   Top match:", gpt5Matches[0].name, `(${gpt5Matches[0].confidence}%)`);
    }

    // Map GPT-5 matches to database phenotypes
    const matches: PhenotypeMatch[] = [];
    const phenotypeMap = new Map(
      phenotypes.rows.map((p: any) => [p.name.toLowerCase(), p])
    );

    for (const match of gpt5Matches.slice(0, topK)) {
      const dbPhenotype = phenotypeMap.get(match.name.toLowerCase());
      if (dbPhenotype) {
        const metadata = dbPhenotype.metadata || {};
        matches.push({
          id: dbPhenotype.id,
          name: dbPhenotype.name,
          description: dbPhenotype.description,
          regions: dbPhenotype.regions || [],
          geographicOrigin: dbPhenotype.geographicOrigin,
          similarity: match.confidence / 100, // Convert to 0-1 range
          connectionScore: metadata.connection_score || metadata.connectionScore || 0,
          parentGroups: metadata.parent_groups || metadata.parentGroups || [],
        });
      } else {
        console.warn(`⚠️  GPT-5 returned unknown phenotype: ${match.name}`);
      }
    }

    return matches;
  } catch (error) {
    console.error("❌ GPT-5 classification failed:", error);
    throw error;
  }
}
