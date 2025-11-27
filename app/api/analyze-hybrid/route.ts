import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { generateImageEmbedding } from "@/lib/embeddings";
import {
  saveUserUpload,
  saveAnalysisHistory,
  createReport,
} from "@/lib/database";
import { checkAIRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { formatApiError, validateRequiredFields } from "@/lib/error-handler";
import { hybridPhenotypeMatch, generateHybridAnalysisText } from "@/lib/hybrid-matcher";
import { performMultiModalAnalysis, describeMultiModalFeatures, enhanceMatchesWithMultiModal } from "@/lib/multi-modal-analysis";
import { withTimeout, TIMEOUTS } from "@/lib/timeout-utils";
import { validateImageUrl } from "@/lib/url-validator";
import { classifyImageWithVisionLLM } from "@/lib/vision-llm-client";
import OpenAI from "openai";

/**
 * Enhanced analysis endpoint using hybrid matching
 * Combines embeddings + facial measurements + multi-modal analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkAIRateLimit(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        rateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset),
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const validation = validateRequiredFields(body, ['imageUrl']);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { imageUrl } = body;

    // Validate image URL (SSRF protection)
    const urlValidation = validateImageUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    console.log("🔄 Starting hybrid analysis pipeline...");

    // Step 1: Generate embedding (required)
    console.log("1/5 Generating AI embedding...");
    const embedding = await generateImageEmbedding(imageUrl);

    // Step 2: Hybrid matching (embeddings + facial measurements)
    console.log("2/5 Running hybrid phenotype matching...");
    const hybridResult = await hybridPhenotypeMatch(imageUrl, embedding, 10);

    // Step 3: Multi-modal analysis (hair, eyes, skin)
    console.log("3/5 Performing multi-modal analysis...");
    const multiModalAnalysis = await performMultiModalAnalysis(imageUrl);

    // Step 4: Enhance matches with multi-modal data
    let finalMatches = hybridResult.matches;
    if (multiModalAnalysis) {
      console.log("4/5 Enhancing matches with multi-modal data...");
      finalMatches = enhanceMatchesWithMultiModal(
        hybridResult.matches,
        multiModalAnalysis
      ) as any;
      // Re-sort by adjusted similarity
      finalMatches.sort((a: any, b: any) => (b.adjustedSimilarity || b.hybridScore) - (a.adjustedSimilarity || a.hybridScore));
    }

    // Step 5: Run vision LLM classification (optional enrichment)
    console.log("4.5/5 Requesting vision LLM classification...");
    const visionLLMResult = await classifyImageWithVisionLLM(imageUrl);

    const llmSummary = visionLLMResult
      ? {
          analysis: visionLLMResult.analysis,
          primaryRegion: visionLLMResult.primary_region,
          provider: visionLLMResult.provider,
          costEstimate: visionLLMResult.cost_estimate,
          matches: visionLLMResult.matches ?? [],
        }
      : null;

    if (llmSummary) {
      console.log(
        `📊 Vision LLM provider ${llmSummary.provider ?? "unknown"} returned ${llmSummary.matches.length} matches.`
      );
      const normalize = (value: string) =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .trim();

      const llmMatchMap = new Map(
        llmSummary.matches.map((match, index) => [
          normalize(match.phenotype),
          { ...match, rank: index + 1 },
        ])
      );

      finalMatches = finalMatches.map((match: any) => {
        const normalizedName = normalize(match.name || "");
        const llmMatch = llmMatchMap.get(normalizedName);

        const llmGroups = new Set<string>();
        (match.parentGroups || []).forEach((group: string) => {
          if (group) llmGroups.add(group);
        });
        (match.regions || []).forEach((region: string) => {
          if (region) llmGroups.add(region);
        });
        if (llmSummary.primaryRegion) {
          llmGroups.add(llmSummary.primaryRegion);
        }
        const additionalGroups = Array.isArray(llmMatch?.groups)
          ? llmMatch?.groups
          : Array.isArray(llmMatch?.hierarchy)
          ? llmMatch?.hierarchy
          : [];
        additionalGroups.forEach((group) => {
          if (group) llmGroups.add(group);
        });

        return {
          ...match,
          llmConfidence: llmMatch?.confidence,
          llmReasoning: llmMatch?.reasoning,
          llmGroups: Array.from(llmGroups),
          llmProvider: llmSummary.provider,
          llmAnalysis: llmSummary.analysis,
          llmPrimaryRegion: llmSummary.primaryRegion,
          llmMatchRank: llmMatch?.rank,
          llmCostEstimate: llmSummary.costEstimate,
        };
      });
    }

    // Step 6: Generate comprehensive AI report
    console.log("5/5 Generating AI report...");
    const aiReport = await generateEnhancedReport(
      finalMatches.slice(0, 5),
      hybridResult.facialFeatures,
      hybridResult.measurements,
      multiModalAnalysis
    );

    // Save to database
    console.log("💾 Saving analysis results...");
    const uploadId = await saveUserUpload(user.id, imageUrl, embedding);

    const analysisId = await saveAnalysisHistory(
      user.id,
      uploadId,
      finalMatches.slice(0, 10),
      aiReport
    );

    // Create premium report entry
    const reportId = await createReport(
      user.id,
      uploadId,
      analysisId,
      finalMatches[0].id,
      finalMatches.slice(1, 5).map((m: any) => ({
        id: m.id,
        name: m.name,
        similarity: m.adjustedSimilarity || m.hybridScore || m.similarity,
      }))
    );

    console.log("✅ Hybrid analysis complete!");

    return NextResponse.json({
      analysisId,
      reportId,
      matches: finalMatches.slice(0, 10),
      aiReport,
      facialFeatures: hybridResult.facialFeatures,
      multiModalAnalysis,
      visionLLM: llmSummary,
      analysisType: "hybrid", // Indicates this used advanced analysis
      uploadedImageUrl: imageUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      formatApiError(error, "Failed to analyze image. Please try again."),
      { status: 500 }
    );
  }
}

/**
 * Generate enhanced AI report with all available data
 */
async function generateEnhancedReport(
  matches: any[],
  facialFeatures: any,
  measurements: any,
  multiModalAnalysis: any
): Promise<string> {
  const openai = createOpenAIClient();
  if (!openai) {
    console.warn("OPENAI_API_KEY not set. Returning fallback report.");
    return generateFallbackReport(matches);
  }

  const matchDescriptions = matches
    .map((m, i) => {
      const score = m.adjustedSimilarity || m.hybridScore || m.similarity;
      return `${i + 1}. ${m.name} (${Math.round(score * 100)}% match)${
        m.regions ? ` - ${m.regions.join(", ")}` : ""
      }${m.confidence ? ` [${m.confidence} confidence]` : ""}`;
    })
    .join("\n");

  const facialAnalysis = facialFeatures
    ? `\nFacial Structure Analysis:
- Face Shape: ${facialFeatures.faceShape}
- Nose Type: ${facialFeatures.noseType}
- Jaw Type: ${facialFeatures.jawType}
- Proportions: ${facialFeatures.proportions}
- Key Features: ${facialFeatures.characteristics.join(", ")}`
    : "";

  const multiModalDescription = multiModalAnalysis
    ? `\nPhysical Characteristics:
- Hair: ${multiModalAnalysis.hairColor.shade} ${multiModalAnalysis.hairColor.texture}
- Eyes: ${multiModalAnalysis.eyeColor.shade}
- Skin: ${multiModalAnalysis.skinTone.description} (Fitzpatrick Type ${multiModalAnalysis.skinTone.fitzpatrick})`
    : "";

  const prompt = `You are writing a comprehensive phenotype analysis report based on advanced AI and anthropometric analysis.

COMPUTATIONAL MATCHES (from hybrid analysis):
${matchDescriptions}
${facialAnalysis}
${multiModalDescription}

Write a detailed, professional 400-500 word report that:

1. Summarizes the primary phenotype match and what it reveals about facial structure
2. Explains how facial measurements support this classification
3. Discusses the secondary matches and what they indicate
4. If multi-modal data is present, integrates hair/eye/skin analysis
5. Provides historical and geographic context
6. Emphasizes this is educational facial geometry analysis
7. Includes appropriate scientific disclaimers

Use professional, scientific language. Be factual and educational. Make it engaging and informative.`;

  try {
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      }),
      TIMEOUTS.AI_API_CALL,
      'OpenAI enhanced report generation'
    );

    return completion.choices[0]?.message?.content || generateFallbackReport(matches);
  } catch (error) {
    console.error("Enhanced report generation error:", error);
    return generateFallbackReport(matches);
  }
}

/**
 * Fallback report if AI generation fails
 */
function generateFallbackReport(matches: any[]): string {
  const topMatch = matches[0];
  const secondaryMatches = matches.slice(1, 3);

  return `Your facial structure analysis using advanced hybrid matching reveals a primary similarity to the ${topMatch.name} phenotype (${Math.round((topMatch.adjustedSimilarity || topMatch.similarity) * 100)}% match).

This match is determined through a combination of AI-powered embedding analysis and precise anthropometric facial measurements. The system analyzed facial proportions, feature ratios, and structural characteristics to identify this classification.

Secondary matches include ${secondaryMatches.map(m => m.name).join(' and ')}, indicating shared structural characteristics across these phenotypic patterns.

This computational analysis is based on geometric facial morphology comparison against a reference database of historical anthropological classifications. Results are for educational purposes and represent structural similarity, not ancestry or ethnic determination.`;
}

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
}
