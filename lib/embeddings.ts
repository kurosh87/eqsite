/**
 * Generate image embeddings using InsightFace (ArcFace) via local Python service
 * Returns a 512-dimensional vector embedding optimized for facial features
 */

import { createTimeoutSignal, TIMEOUTS } from './timeout-utils';

const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || 'http://127.0.0.1:5001';

export async function generateImageEmbedding(imageUrl: string): Promise<number[]> {
  try {
    // Call local Python embedding service with timeout
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/api/embeddings/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl: imageUrl,
      }),
      signal: createTimeoutSignal(TIMEOUTS.AI_API_CALL),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(
        `Embedding service error (${response.status}): ${errorData.error || errorData.details || 'Unknown error'}`
      );
    }

    const data = await response.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error('Invalid embedding format received from service');
    }

    // Expect true 512D embeddings (matches DB schema: vector(512))
    const dims = data.dimensions || data.embedding.length;
    if (dims !== 512) {
      throw new Error(`Unexpected embedding dimensions: ${dims}`);
    }

    console.log(
      `✓ Generated 512D embedding (score: ${data.metadata?.detection_score?.toFixed?.(3) ?? "n/a"})`
    );

    return data.embedding as number[];
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error(`Failed to generate image embedding: ${error}`);
  }
}

/**
 * Calculate cosine similarity between two vectors
 * Returns a value between -1 and 1, where 1 means identical
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Format similarity score as percentage
 */
export function similarityToPercentage(similarity: number): number {
  return Math.round(similarity * 100);
}

/**
 * Check if embedding service is healthy
 */
export async function checkEmbeddingServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/health`, {
      method: 'GET',
      signal: createTimeoutSignal(5000), // 5 second timeout for health check
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.status === 'healthy' && data.matcher_loaded === true;
  } catch (error) {
    console.error("Embedding service health check failed:", error);
    return false;
  }
}
