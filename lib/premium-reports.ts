/**
 * Premium Report Generation System
 * Uses Anthropic Claude for detailed, comprehensive phenotype analysis reports
 */

import Anthropic from "@anthropic-ai/sdk";
import { PhenotypeMatch } from "@/lib/database";
import { FacialMeasurements } from "@/lib/face-analysis";
import { withTimeout, TIMEOUTS } from "./timeout-utils";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export interface PremiumReportSection {
  sectionType: string;
  title: string;
  content: string;
  citations?: Array<{ text: string; url?: string }>;
}

/**
 * Generate complete premium report with all sections
 */
export async function generatePremiumReport(
  matches: PhenotypeMatch[],
  userMeasurements?: FacialMeasurements | null,
  uploadImageUrl?: string
): Promise<PremiumReportSection[]> {
  if (!anthropic) {
    console.warn("Anthropic API not configured, using basic reports");
    return generateBasicReport(matches);
  }

  const sections: PremiumReportSection[] = [];

  try {
    // Generate each section
    sections.push(await generateOverviewSection(matches, userMeasurements));
    sections.push(await generateGeneticSection(matches));
    sections.push(await generateHistoricalSection(matches));
    sections.push(await generateGeographicSection(matches));
    sections.push(await generateCulturalSection(matches));

    return sections;
  } catch (error) {
    console.error("Error generating premium report:", error);
    return generateBasicReport(matches);
  }
}

/**
 * Generate Overview Section
 */
async function generateOverviewSection(
  matches: PhenotypeMatch[],
  measurements?: FacialMeasurements | null
): Promise<PremiumReportSection> {
  const topMatch = matches[0];
  const secondaryMatches = matches.slice(1, 5);

  const prompt = `You are a professional anthropologist writing an educational report about facial morphology analysis.

PRIMARY MATCH: ${topMatch.name} (${(topMatch.similarity * 100).toFixed(1)}% similarity)
Geographic Origin: ${topMatch.regions?.join(", ") || "Various regions"}
${topMatch.description || ""}

SECONDARY MATCHES:
${secondaryMatches.map((m, i) => `${i + 1}. ${m.name} (${(m.similarity * 100).toFixed(1)}%) - ${m.regions?.join(", ") || "Various"}`).join('\n')}

${measurements ? `
FACIAL MEASUREMENTS:
- Face Width/Height Ratio: ${measurements.faceWidthToHeightRatio.toFixed(2)}
- Nasal Index: ${measurements.nasalIndex.toFixed(2)}
- Facial Index: ${measurements.facialIndex.toFixed(2)}
- Jaw Width Ratio: ${measurements.jawToFaceWidthRatio.toFixed(2)}
` : ''}

Write a comprehensive 400-500 word overview section explaining:
1. What these computational matches reveal about facial structure
2. The primary phenotype characteristics
3. How the measurements support this classification
4. What this means in terms of historical human population variation
5. Important disclaimer: This is educational facial geometry analysis, not ancestry determination

Use professional, scientific language. Be factual and educational.`;

  try {
    const response = await withTimeout(
      anthropic!.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: prompt,
        }],
      }),
      TIMEOUTS.AI_API_CALL,
      'Anthropic overview generation'
    );

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      sectionType: 'overview',
      title: 'Overview & Summary',
      content,
      citations: [{
        text: "Analysis based on computational facial morphology comparison",
        url: "https://en.wikipedia.org/wiki/Anthropometry",
      }],
    };
  } catch (error) {
    console.error("Error generating overview:", error);
    return {
      sectionType: 'overview',
      title: 'Overview & Summary',
      content: `Your facial structure shows strongest similarity to the ${topMatch.name} phenotype (${(topMatch.similarity * 100).toFixed(1)}% match), with secondary matches to ${secondaryMatches.slice(0, 2).map(m => m.name).join(' and ')}. These computational matches are based on geometric facial analysis and historical anthropological reference data.`,
    };
  }
}

/**
 * Generate Genetic Analysis Section
 */
async function generateGeneticSection(matches: PhenotypeMatch[]): Promise<PremiumReportSection> {
  const topMatches = matches.slice(0, 3);

  const prompt = `You are a geneticist writing about population genetics related to facial morphology.

TOP PHENOTYPE MATCHES:
${topMatches.map((m, i) => `${i + 1}. ${m.name} - ${m.regions?.join(", ") || "Various regions"}`).join('\n')}

Write a 300-400 word section on the genetic aspects:
1. What genetic factors influence facial structure
2. How these phenotypes relate to historical population groups
3. Common genetic markers associated with these populations
4. Migration and admixture patterns
5. Important: Explain this is about population-level patterns, not individual ancestry

Be scientifically accurate. Cite when possible. Use educational tone.`;

  try {
    const response = await anthropic!.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      sectionType: 'genetic',
      title: 'Genetic Background & Population Genetics',
      content,
      citations: [
        { text: "Human Population Genetics", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5299519/" },
        { text: "Genetic basis of facial morphology", url: "https://www.nature.com/articles/ng.3211" },
      ],
    };
  } catch (error) {
    console.error("Error generating genetic section:", error);
    return {
      sectionType: 'genetic',
      title: 'Genetic Background & Population Genetics',
      content: `The genetic factors that influence facial structure are complex and involve hundreds of genetic variants. The phenotypes identified in your analysis (${topMatches.map(m => m.name).join(', ')}) represent population-level patterns that have evolved over thousands of years through adaptation to different environments and genetic drift.`,
    };
  }
}

/**
 * Generate Historical Context Section
 */
async function generateHistoricalSection(matches: PhenotypeMatch[]): Promise<PremiumReportSection> {
  const topMatch = matches[0];

  const prompt = `You are a historian writing about the historical context of the ${topMatch.name} phenotype.

PHENOTYPE: ${topMatch.name}
REGIONS: ${topMatch.regions?.join(", ") || "Various"}

Write a 300-400 word section covering:
1. Historical origins and development of this phenotype
2. Major historical populations associated with this classification
3. Migration patterns and historical movements
4. Cultural significance in anthropological literature
5. How this phenotype was historically classified

Use engaging, educational language. Be historically accurate.`;

  try {
    const response = await withTimeout(
      anthropic!.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
      TIMEOUTS.AI_API_CALL,
      'Anthropic historical section'
    );

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      sectionType: 'historical',
      title: 'Historical Context & Origins',
      content,
      citations: [{
        text: "Historical anthropology and human classification",
        url: "https://en.wikipedia.org/wiki/Historical_race_concepts",
      }],
    };
  } catch (error) {
    console.error("Error generating historical section:", error);
    return {
      sectionType: 'historical',
      title: 'Historical Context & Origins',
      content: `The ${topMatch.name} phenotype has been documented in anthropological literature as representing populations from ${topMatch.regions?.join(", ") || "various regions"}. This classification emerged from early anthropological studies and represents one of many ways historical researchers categorized human physical variation.`,
    };
  }
}

/**
 * Generate Geographic Distribution Section
 */
async function generateGeographicSection(matches: PhenotypeMatch[]): Promise<PremiumReportSection> {
  const allRegions = [...new Set(matches.flatMap(m => m.regions || []))];

  const prompt = `You are a geographer writing about the geographic distribution of phenotypes.

MATCHED PHENOTYPES AND REGIONS:
${matches.slice(0, 5).map((m, i) => `${i + 1}. ${m.name} - ${m.regions?.join(", ") || "Various"}`).join('\n')}

Write a 300-400 word section covering:
1. Geographic distribution of these phenotypes
2. Environmental factors that shaped these characteristics
3. Current populations in these regions
4. Migration and diaspora patterns
5. Modern geographic diversity

Use clear, educational language with geographic accuracy.`;

  try {
    const response = await withTimeout(
      anthropic!.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
      TIMEOUTS.AI_API_CALL,
      'Anthropic geographic section'
    );

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      sectionType: 'geographic',
      title: 'Geographic Distribution & Environment',
      content,
      citations: [{
        text: "Human geographic variation",
        url: "https://en.wikipedia.org/wiki/Human_genetic_variation",
      }],
    };
  } catch (error) {
    console.error("Error generating geographic section:", error);
    return {
      sectionType: 'geographic',
      title: 'Geographic Distribution & Environment',
      content: `The phenotypes identified in your analysis are primarily associated with ${allRegions.join(", ")}. These geographic patterns reflect thousands of years of human adaptation to different climates, altitudes, and environmental conditions. Modern populations in these regions show considerable diversity due to historical migrations and admixture.`,
    };
  }
}

/**
 * Generate Cultural Significance Section
 */
async function generateCulturalSection(matches: PhenotypeMatch[]): Promise<PremiumReportSection> {
  const topMatch = matches[0];

  const prompt = `You are a cultural anthropologist writing about the cultural context of the ${topMatch.name} phenotype.

PHENOTYPE: ${topMatch.name}
REGIONS: ${topMatch.regions?.join(", ") || "Various"}

Write a 250-350 word section covering:
1. Cultural diversity within populations showing this phenotype
2. Notable cultural achievements and contributions
3. Modern cultural identity and diversity
4. Importance of avoiding stereotyping
5. Celebration of human diversity

Use respectful, inclusive language. Celebrate diversity.`;

  try {
    const response = await withTimeout(
      anthropic!.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
      TIMEOUTS.AI_API_CALL,
      'Anthropic cultural section'
    );

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      sectionType: 'cultural',
      title: 'Cultural Context & Diversity',
      content,
    };
  } catch (error) {
    console.error("Error generating cultural section:", error);
    return {
      sectionType: 'cultural',
      title: 'Cultural Context & Diversity',
      content: `Populations associated with the ${topMatch.name} phenotype represent rich cultural diversity across ${topMatch.regions?.join(", ") || "multiple regions"}. It's important to recognize that physical appearance is just one small aspect of human identity, and that cultures within any geographic or phenotypic group show tremendous diversity, creativity, and contribution to human civilization.`,
    };
  }
}

/**
 * Fallback: Generate basic report without AI
 */
function generateBasicReport(matches: PhenotypeMatch[]): PremiumReportSection[] {
  const topMatch = matches[0];

  return [
    {
      sectionType: 'overview',
      title: 'Overview & Summary',
      content: `Your facial structure analysis shows strongest similarity to the ${topMatch.name} phenotype (${(topMatch.similarity * 100).toFixed(1)}% match). This computational match is based on geometric facial analysis comparing your features against a reference database of historical anthropological classifications. Secondary matches include ${matches.slice(1, 4).map(m => m.name).join(', ')}, suggesting common structural characteristics with these phenotypic patterns.`,
    },
    {
      sectionType: 'geographic',
      title: 'Geographic Distribution',
      content: `The ${topMatch.name} phenotype is historically associated with populations from ${topMatch.regions?.join(", ") || "various regions"}. These geographic patterns reflect thousands of years of human adaptation and migration.`,
    },
    {
      sectionType: 'disclaimer',
      title: 'Important Notice',
      content: `This analysis is a computational tool for educational purposes based on geometric facial analysis. It compares facial structure against historical anthropological reference data and should not be used as a determination of ancestry, ethnicity, or identity. Human diversity is complex and cannot be reduced to simple categories.`,
    },
  ];
}

/**
 * Check if Anthropic API is available
 */
export function isPremiumReportsAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
