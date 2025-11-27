/**
 * Multi-Modal AI Analysis
 * Phase 3 feature: Analyzes hair color, eye color, skin tone beyond face shape
 */

import OpenAI from "openai";
import { withTimeout, TIMEOUTS } from "./timeout-utils";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface MultiModalAnalysis {
  hairColor: {
    primary: string;
    shade: string;
    texture: string;
    confidence: number;
  };
  eyeColor: {
    primary: string;
    shade: string;
    pattern: string;
    confidence: number;
  };
  skinTone: {
    fitzpatrick: number; // 1-6 scale
    undertone: string;
    description: string;
    confidence: number;
  };
  facialHair?: {
    present: boolean;
    type?: string;
    color?: string;
  };
  ageEstimate?: {
    range: string;
    confidence: number;
  };
}

/**
 * Analyze image for hair, eyes, skin tone using GPT-4 Vision
 */
export async function performMultiModalAnalysis(
  imageUrl: string
): Promise<MultiModalAnalysis | null> {
  try {
    const response = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this portrait photo and provide detailed information about:

1. HAIR COLOR AND TEXTURE:
   - Primary color (black, dark brown, brown, light brown, blonde, red, gray, white)
   - Specific shade/tone
   - Texture (straight, wavy, curly, coily)

2. EYE COLOR:
   - Primary color (brown, dark brown, hazel, green, blue, gray)
   - Specific shade
   - Any patterns (central heterochromia, limbal ring, etc.)

3. SKIN TONE:
   - Fitzpatrick scale (1-6): 1=very fair, 2=fair, 3=medium, 4=olive, 5=brown, 6=dark brown
   - Undertone (warm, cool, neutral)
   - General description

4. FACIAL HAIR (if present):
   - Type (beard, mustache, stubble, etc.)
   - Color

5. AGE ESTIMATE:
   - Approximate age range (e.g., "20-30", "30-40", "40-50")

Return your analysis as a structured JSON object with this exact format:
{
  "hairColor": {
    "primary": "dark brown",
    "shade": "chocolate brown",
    "texture": "straight",
    "confidence": 0.9
  },
  "eyeColor": {
    "primary": "brown",
    "shade": "dark brown",
    "pattern": "uniform",
    "confidence": 0.95
  },
  "skinTone": {
    "fitzpatrick": 3,
    "undertone": "warm",
    "description": "medium with warm undertones",
    "confidence": 0.85
  },
  "facialHair": {
    "present": false
  },
  "ageEstimate": {
    "range": "25-35",
    "confidence": 0.7
  }
}

Be precise and objective. Use only the categories provided.`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 800,
      }),
      TIMEOUTS.AI_API_CALL,
      'OpenAI multi-modal vision analysis'
    );

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const analysis: MultiModalAnalysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error("Multi-modal analysis error:", error);
    return null;
  }
}

/**
 * Generate description from multi-modal analysis
 */
export function describeMultiModalFeatures(analysis: MultiModalAnalysis): string {
  const parts: string[] = [];

  // Hair description
  parts.push(`${analysis.hairColor.shade} ${analysis.hairColor.texture} hair`);

  // Eye description
  parts.push(`${analysis.eyeColor.shade} eyes`);

  // Skin description
  parts.push(`${analysis.skinTone.description} skin (Fitzpatrick Type ${analysis.skinTone.fitzpatrick})`);

  // Age
  if (analysis.ageEstimate) {
    parts.push(`estimated age ${analysis.ageEstimate.range}`);
  }

  return parts.join(", ");
}

/**
 * Enhance phenotype matches with multi-modal data
 * Adjusts similarity scores based on hair/eye/skin compatibility
 */
export function enhanceMatchesWithMultiModal(
  matches: any[],
  multiModalAnalysis: MultiModalAnalysis
): any[] {
  return matches.map(match => {
    let multiModalBonus = 0;

    // Adjust based on hair color compatibility
    const phenotypeName = match.name.toLowerCase();

    // Very simplified correlation - in production, use actual data
    if (multiModalAnalysis.hairColor.primary === 'blonde' || multiModalAnalysis.hairColor.primary === 'light brown') {
      if (phenotypeName.includes('nordic') || phenotypeName.includes('atlanto') || phenotypeName.includes('baltic')) {
        multiModalBonus += 0.05;
      }
    }

    if (multiModalAnalysis.hairColor.primary === 'black' || multiModalAnalysis.hairColor.primary === 'dark brown') {
      if (phenotypeName.includes('mediterranean') || phenotypeName.includes('alpine') ||
          phenotypeName.includes('asian') || phenotypeName.includes('african')) {
        multiModalBonus += 0.03;
      }
    }

    // Adjust based on eye color
    if (multiModalAnalysis.eyeColor.primary === 'blue' || multiModalAnalysis.eyeColor.primary === 'green') {
      if (phenotypeName.includes('nordic') || phenotypeName.includes('baltic') || phenotypeName.includes('slavic')) {
        multiModalBonus += 0.05;
      }
    }

    // Adjust based on skin tone
    if (multiModalAnalysis.skinTone.fitzpatrick <= 2) {
      if (phenotypeName.includes('nordic') || phenotypeName.includes('nordic') || phenotypeName.includes('baltic')) {
        multiModalBonus += 0.03;
      }
    } else if (multiModalAnalysis.skinTone.fitzpatrick >= 5) {
      if (phenotypeName.includes('african') || phenotypeName.includes('melanesid') || phenotypeName.includes('australid')) {
        multiModalBonus += 0.03;
      }
    }

    return {
      ...match,
      multiModalBonus,
      adjustedSimilarity: Math.min(match.similarity + multiModalBonus, 1.0),
    };
  });
}
