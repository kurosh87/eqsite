/**
 * Hybrid Phenotype Matching System
 * Combines vector embeddings (70%) with facial measurements (30%)
 * for improved accuracy
 */

import { findSimilarPhenotypes, PhenotypeMatch } from "@/lib/database";
import { extractFacialMeasurements, compareFacialMeasurements, analyzeFacialFeatures, FacialMeasurements } from "@/lib/face-analysis";

export interface HybridMatch extends PhenotypeMatch {
  embeddingSimilarity: number;
  measurementSimilarity: number;
  hybridScore: number;
  facialFeatures?: {
    faceShape: string;
    noseType: string;
    jawType: string;
    proportions: string;
    characteristics: string[];
  };
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Weight configuration for hybrid matching
 */
const WEIGHTS = {
  embedding: 0.70, // 70% weight for AI embedding similarity
  measurement: 0.30, // 30% weight for anthropometric measurements
};

/**
 * Perform hybrid phenotype matching
 * Combines embedding-based and measurement-based matching
 */
export async function hybridPhenotypeMatch(
  imageUrl: string,
  embedding: number[],
  limit: number = 10
): Promise<{
  matches: HybridMatch[];
  facialFeatures: ReturnType<typeof analyzeFacialFeatures> | null;
  measurements: FacialMeasurements | null;
}> {
  try {
    // Step 1: Get embedding-based matches (fast, AI-powered)
    console.log("Getting embedding-based matches...");
    const embeddingMatches = await findSimilarPhenotypes(embedding, limit * 2);

    // Step 2: Extract facial measurements from uploaded image
    console.log("Extracting facial measurements...");
    const userMeasurements = await extractFacialMeasurements(imageUrl);

    // If measurements fail, fall back to embedding-only matching
    if (!userMeasurements) {
      console.warn("Facial measurements failed, using embedding-only matching");
      return {
        matches: embeddingMatches.map(m => ({
          ...m,
          embeddingSimilarity: m.similarity,
          measurementSimilarity: 0,
          hybridScore: m.similarity,
          confidence: m.similarity > 0.8 ? 'high' : m.similarity > 0.6 ? 'medium' : 'low',
        })),
        facialFeatures: null,
        measurements: null,
      };
    }

    // Step 3: Get stored measurements for reference phenotypes
    // For MVP, we'll simulate this - in production, you'd have pre-computed measurements
    console.log("Computing hybrid scores...");

    const hybridMatches: HybridMatch[] = embeddingMatches.map(match => {
      // Simulate anthropometric comparison
      // In production, compare against stored measurements for each phenotype
      const measurementSimilarity = simulateMeasurementSimilarity(
        userMeasurements,
        match.name
      );

      // Calculate weighted hybrid score
      const hybridScore =
        (match.similarity * WEIGHTS.embedding) +
        (measurementSimilarity * WEIGHTS.measurement);

      // Determine confidence based on hybrid score
      let confidence: 'high' | 'medium' | 'low' = 'low';
      if (hybridScore > 0.80) confidence = 'high';
      else if (hybridScore > 0.65) confidence = 'medium';

      return {
        ...match,
        embeddingSimilarity: match.similarity,
        measurementSimilarity,
        hybridScore,
        confidence,
      };
    });

    // Sort by hybrid score (descending)
    hybridMatches.sort((a, b) => b.hybridScore - a.hybridScore);

    // Get top matches and analyze features
    const topMatches = hybridMatches.slice(0, limit);
    const facialFeatures = analyzeFacialFeatures(userMeasurements);

    // Add facial features to top match
    if (topMatches.length > 0) {
      topMatches[0].facialFeatures = facialFeatures;
    }

    return {
      matches: topMatches,
      facialFeatures,
      measurements: userMeasurements,
    };
  } catch (error) {
    console.error("Hybrid matching error:", error);

    // Fall back to embedding-only matching
    const embeddingMatches = await findSimilarPhenotypes(embedding, limit);
    return {
      matches: embeddingMatches.map(m => ({
        ...m,
        embeddingSimilarity: m.similarity,
        measurementSimilarity: 0,
        hybridScore: m.similarity,
        confidence: m.similarity > 0.8 ? 'high' : m.similarity > 0.6 ? 'medium' : 'low',
      })),
      facialFeatures: null,
      measurements: null,
    };
  }
}

/**
 * Simulate measurement similarity based on phenotype characteristics
 * In production, this would compare against actual stored measurements
 */
function simulateMeasurementSimilarity(
  userMeasurements: FacialMeasurements,
  phenotypeName: string
): number {
  // This is a simplified simulation
  // In production, you would:
  // 1. Store facial measurements for each reference phenotype
  // 2. Compare user measurements against stored measurements
  // 3. Return actual similarity score

  // For now, we'll use phenotype name patterns to simulate
  const phenotypeLower = phenotypeName.toLowerCase();

  // Simulate based on facial characteristics
  let similarity = 0.5; // Base similarity

  // Adjust based on face shape patterns
  if (userMeasurements.faceWidthToHeightRatio > 0.85) {
    // Broader face
    if (phenotypeLower.includes('alpine') || phenotypeLower.includes('dinarid') ||
        phenotypeLower.includes('armenid') || phenotypeLower.includes('east')) {
      similarity += 0.2;
    }
  } else if (userMeasurements.faceWidthToHeightRatio < 0.70) {
    // Narrower face
    if (phenotypeLower.includes('mediterranean') || phenotypeLower.includes('atlanto') ||
        phenotypeLower.includes('gracile') || phenotypeLower.includes('nordic')) {
      similarity += 0.2;
    }
  }

  // Adjust based on nasal index
  if (userMeasurements.nasalIndex > 0.85) {
    // Broader nose
    if (phenotypeLower.includes('african') || phenotypeLower.includes('melanesid') ||
        phenotypeLower.includes('south') || phenotypeLower.includes('bantuid')) {
      similarity += 0.15;
    }
  } else if (userMeasurements.nasalIndex < 0.70) {
    // Narrower nose
    if (phenotypeLower.includes('nordic') || phenotypeLower.includes('sino') ||
        phenotypeLower.includes('east') || phenotypeLower.includes('alpine')) {
      similarity += 0.15;
    }
  }

  // Ensure similarity is between 0 and 1
  return Math.min(Math.max(similarity, 0), 1);
}

/**
 * Generate hybrid analysis report
 */
export function generateHybridAnalysisText(
  measurements: FacialMeasurements,
  facialFeatures: ReturnType<typeof analyzeFacialFeatures>
): string {
  return `
Facial Analysis Results:

Face Shape: ${facialFeatures.faceShape}
Face Proportions: ${facialFeatures.proportions}
Nasal Structure: ${facialFeatures.noseType}
Jaw Structure: ${facialFeatures.jawType}

Key Measurements:
• Face Width-to-Height Ratio: ${measurements.faceWidthToHeightRatio.toFixed(2)}
• Nasal Index: ${measurements.nasalIndex.toFixed(2)}
• Facial Index: ${measurements.facialIndex.toFixed(2)}
• Eye Spacing Ratio: ${measurements.eyeSpacingRatio.toFixed(2)}

Distinctive Characteristics:
${facialFeatures.characteristics.map(c => `• ${c}`).join('\n')}

Analysis Confidence: ${(measurements.confidence * 100).toFixed(0)}%
Landmarks Detected: ${measurements.landmarkCount}
  `.trim();
}
