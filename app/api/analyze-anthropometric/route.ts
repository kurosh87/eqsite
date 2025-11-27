import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import {
  saveUserUpload,
  saveAnalysisHistory,
  createReport,
  getPhenotypeIdsByNames,
} from "@/lib/database";
import type { PhenotypeMatch } from "@/lib/database";
import OpenAI from "openai";
import { checkAIRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { formatApiError, validateRequiredFields } from "@/lib/error-handler";
import { withTimeout, TIMEOUTS } from "@/lib/timeout-utils";
import { validateImageUrl } from "@/lib/url-validator";
import { logger } from "@/lib/logger";

type AnthropometricMatch = PhenotypeMatch & {
  measurementSimilarity?: number;
  llmSimilarity?: number;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// URL of your Python FastAPI service
const EMBEDDING_SERVICE_URL = process.env.EMBEDDING_SERVICE_URL || "http://localhost:8000";
const EMBEDDING_HEALTH_TIMEOUT_MS = Number(
  process.env.EMBEDDING_SERVICE_HEALTH_TIMEOUT_MS || 4000
);

async function ensureEmbeddingServiceHealthy() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), EMBEDDING_HEALTH_TIMEOUT_MS);
  try {
    const response = await fetch(`${EMBEDDING_SERVICE_URL}/health`, {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    const payload = await response.json();
    if (!payload?.status) {
      throw new Error("Health payload missing status flag");
    }
    return payload;
  } catch (error) {
    console.error("Anthropometric service health check failed:", error);
    throw new Error("Anthropometric service is unavailable. Please try again shortly.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestStart = Date.now();
    // Check authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    // Check rate limit (stricter for AI operations)
    const rateLimitResult = await checkAIRateLimit(userId);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        rateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset),
        { status: 429 }
      );
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Validate image URL (SSRF protection)
    const urlValidation = validateImageUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    await ensureEmbeddingServiceHealthy();

    // Step 1: Download the image from URL
    logger.debug("Downloading image from URL...");
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Step 2: Send to Python service for anthropometric analysis
    logger.debug("Sending to anthropometric analysis service...");
    const analysisStart = Date.now();
    const formData = new FormData();
    formData.append('file', new Blob([imageBuffer], { type: imageBlob.type }), 'image.jpg');
    formData.append('top_k', '10');

    const analysisResponse = await fetch(`${EMBEDDING_SERVICE_URL}/analyze-phenotype`, {
      method: 'POST',
      body: formData,
    });

    if (!analysisResponse.ok) {
      const error = await analysisResponse.json();
      throw new Error(error.detail || 'Analysis failed');
    }

    const analysisResult = await analysisResponse.json();
    logger.debug(`Python service responded in ${Date.now() - analysisStart}ms`);

    // Step 3: Resolve matches to stored phenotypes
    logger.debug("Processing analysis results...");
    const rawMatches: any[] = Array.isArray(analysisResult.matches)
      ? analysisResult.matches
      : [];

    const phenotypeNames = Array.from(
      new Set(
        rawMatches
          .map((match) =>
            typeof match?.phenotype === "string" ? match.phenotype.trim() : null
          )
          .filter((name): name is string => !!name)
      )
    );

    const resolvedPhenotypes = await getPhenotypeIdsByNames(phenotypeNames);
    const phenotypeIdMap = new Map(
      resolvedPhenotypes.map((phenotype) => [
        phenotype.name.toLowerCase(),
        phenotype,
      ])
    );

    const matches = rawMatches
      .map((match): AnthropometricMatch | null => {
        const name =
          typeof match?.phenotype === "string" ? match.phenotype.trim() : null;
        if (!name) {
          console.warn("Received anthropometric match without a phenotype name", {
            match,
          });
          return null;
        }

        const resolved = phenotypeIdMap.get(name.toLowerCase());
        if (!resolved) {
          console.warn(
            "Unable to resolve phenotype from anthropometric analysis",
            {
              phenotypeName: name,
            }
          );
          return null;
        }

        const measurementSimilarity = typeof match.measurement_similarity === "number"
          ? match.measurement_similarity
          : undefined;
        const llmSimilarity = typeof match.llm_similarity === "number"
          ? match.llm_similarity
          : undefined;

        return {
          id: resolved.id,
          name: resolved.name,
          description: resolved.description,
          regions: resolved.regions,
          imageUrl: resolved.imageUrl ?? "",
          similarity: match.similarity / 100, // Convert percentage to 0-1 scale
          llmReasoning: match.reasoning,
          measurementSimilarity,
          llmSimilarity,
        };
      })
      .filter((match): match is AnthropometricMatch => Boolean(match));

    if (matches.length === 0) {
      console.warn(
        "Anthropometric analysis returned matches but none resolved to stored phenotypes",
        {
          requestedNames: phenotypeNames,
        }
      );
      return NextResponse.json(
        {
          error: "No stored phenotypes matched the analysis results",
          details:
            "The anthropometric analysis could not be linked to known phenotypes. Please try another photo.",
        },
        { status: 424 }
      );
    }

    // Step 4: Save user upload (no embedding for anthropometric approach)
    logger.debug("Saving user upload...");
    const uploadId = await saveUserUpload(userId, imageUrl, null);

    // Step 5: Generate AI report using top matches
    logger.debug("Generating AI report...");
    const topMatches = matches.slice(0, 5);
    const aiReport = await generateAnalysisReport(
      topMatches,
      analysisResult.profile
    );

    // Step 6: Save analysis history
    logger.debug("Saving analysis history...");
    const analysisId = await saveAnalysisHistory(
      userId,
      uploadId,
      matches,
      aiReport
    );

    // Step 7: Create premium report entry
    logger.debug("Creating premium report entry...");
    const primaryPhenotype = matches[0];
    const secondaryPhenotypes = matches.slice(1, 5).map((m: any) => ({
      id: m.id,
      name: m.name,
      similarity: m.similarity,
    }));

    const reportId = await createReport(
      userId,
      uploadId,
      analysisId,
      primaryPhenotype.id,
      secondaryPhenotypes
    );

    logger.debug(`Anthropometric analysis complete. Report ID: ${reportId}`);

    return NextResponse.json({
      analysisId,
      reportId,
      matches,
      aiReport,
      anthropometricProfile: analysisResult.profile,
      uploadedImageUrl: imageUrl,
    });
  } catch (error: any) {
    console.error("Anthropometric analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze image with anthropometric method",
        details: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function generateAnalysisReport(
  matches: any[],
  profile: any
): Promise<string> {
  const matchDescriptions = matches
    .map(
      (m, i) =>
        `${i + 1}. ${m.name} (${Math.round(m.similarity * 100)}% match)\n   LLM Analysis: ${m.reasoning}`
    )
    .join("\n\n");

  const profileSummary = `
ANTHROPOMETRIC MEASUREMENTS:
- Cephalic Index: ${profile.cephalic_index?.toFixed(1)} (${profile.head_shape})
- Facial Index: ${profile.facial_index?.toFixed(1)} (${profile.face_shape})
- Nasal Index: ${profile.nasal_index?.toFixed(1)} (${profile.nose_shape})
- Upper Facial Index: ${profile.upper_facial_index?.toFixed(1)}
- Jaw-to-Face Width Ratio: ${profile.jaw_face_width_ratio?.toFixed(1)}%
`;

  const prompt = `You are writing an educational report about facial anthropometric analysis results.

IMPORTANT CONTEXT: This analysis uses precise facial measurements (anthropometric indices like cephalic index, facial proportions, nasal indices) compared against a historical anthropological reference database. The measurements are objective geometric calculations - NOT subjective assessments.

ANTHROPOMETRIC PROFILE OF THE ANALYZED FACE:
${profileSummary}

TOP 5 GEOMETRIC MATCHES FROM REFERENCE DATABASE:
${matchDescriptions}

Your task: Write a clear, factual 250-350 word report explaining these anthropometric results. Focus on:

1. **Measurement Analysis**: Explain what the key indices (cephalic, facial, nasal) indicate about the person's facial structure
2. **Geometric Patterns**: Describe how these measurements compare to the matched reference types
3. **Scientific Method**: Emphasize this uses objective measurements (ratios, angles, proportions) rather than visual assessment
4. **Historical Context**: These reference categories come from historical anthropological literature, used here as measurement benchmarks
5. **Educational Value**: What can be learned about facial morphology variation from these precise measurements
6. **Clear Disclaimers**: This is automated geometric measurement for educational purposes only, not a determination of ancestry, race, or identity

Tone: Scientific, precise, educational. Focus on the objective measurements and what they reveal about facial structure patterns.

Write the report now:`;

  try {
    logger.debug("Calling GPT-4o mini for anthropometric report...");
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
      TIMEOUTS.AI_API_CALL,
      'OpenAI anthropometric report generation'
    );
    logger.debug("Anthropometric report generated");

    return (
      completion.choices[0]?.message?.content ||
      "Unable to generate analysis report at this time."
    );
  } catch (error) {
    console.error("OpenAI API error:", error);
    return `Anthropometric analysis shows the following facial measurements:
${profileSummary}

Top matches: ${matches.slice(0, 3).map((m) => m.name).join(", ")}.

This analysis is based on precise geometric measurements of facial proportions and is provided for educational purposes only.`;
  }
}
