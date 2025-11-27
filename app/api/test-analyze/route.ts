import { NextRequest, NextResponse } from "next/server";
import { generateImageEmbedding } from "@/lib/embeddings";
import { findSimilarPhenotypes } from "@/lib/database";
import OpenAI from "openai";
import { withTimeout, TIMEOUTS } from "@/lib/timeout-utils";
import { validateImageUrl } from "@/lib/url-validator";
import { logger } from "@/lib/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REPORT_MODEL = process.env.OPENAI_GPT5_REPORT_MODEL || "gpt-5";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // Validate image URL (SSRF protection)
    const urlValidation = validateImageUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    // Step 1: Generate embedding for uploaded image
    logger.debug("Generating embedding for test image...");
    const embedding = await generateImageEmbedding(imageUrl);
    logger.debug("Embedding generated");

    // Step 2: Find similar phenotypes
    logger.debug("Finding similar phenotypes...");
    const matches = await findSimilarPhenotypes(embedding, 10);
    logger.debug(`Found ${matches.length} matches`);

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "No phenotypes found in database." },
        { status: 404 }
      );
    }

    // Step 3: Generate AI report using top matches WITH VISION
    logger.debug("Generating vision report...");
    const topMatches = matches.slice(0, 5);
    const aiReport = await generateAnalysisReport(topMatches, imageUrl);
    logger.debug("Report generated");

    return NextResponse.json({
      success: true,
      matches,
      aiReport,
      uploadedImageUrl: imageUrl,
      test: true,
    });
  } catch (error: any) {
    console.error("❌ Test analysis failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
      { status: 500 }
    );
  }
}

async function generateAnalysisReport(matches: any[], imageUrl: string): Promise<string> {
  const matchDescriptions = matches
    .map(
      (m, i) =>
        `${i + 1}. ${m.name} (${Math.round(m.similarity * 100)}% match)${
          m.geographicOrigin ? ` - Origin: ${m.geographicOrigin}` : ""
        }${m.description ? `\n   ${m.description}` : ""}`
    )
    .join("\n\n");

  const prompt = `You are analyzing facial morphology for an educational phenotype classification system.

CONTEXT: You will see a photograph AND computational matches from our database. The database matches are based on geometric similarity scores. Your task is to analyze the ACTUAL facial structure in the photo and provide educational insights.

Database matches (for reference):
${matchDescriptions}

YOUR TASK: Analyze the facial structure visible in the photograph and write a 200-300 word educational report covering:

1. **Observable Facial Geometry**: What structural characteristics do you observe? (face shape, proportions, feature measurements)
2. **Match Assessment**: Do the database matches align with what you see in the photo? Explain why or why not.
3. **Morphological Features**: Describe key facial features that stand out (nose shape, jaw structure, eye spacing, etc.)
4. **Educational Context**: Brief historical/anthropological context for these facial structure patterns
5. **Disclaimers**: This is automated geometric analysis for educational purposes only

Tone: Professional, scientific, educational. Focus on facial structure patterns, not personal identity.

Write the report now:`;

  try {
    logger.debug(`Calling vision API with model: ${REPORT_MODEL}`);

    const completion = await withTimeout(
      openai.chat.completions.create({
        model: REPORT_MODEL,
        reasoning_effort: "low",
        max_completion_tokens: 900,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl, detail: "high" } }
            ]
          }
        ],
      } as any),
      TIMEOUTS.AI_API_CALL,
      'OpenAI GPT-5 vision report generation'
    );

    logger.debug("Vision API call successful");

    const content = completion.choices[0]?.message?.content;
    const reportText =
      typeof content === "string"
        ? content
        : Array.isArray(content)
          ? (content as any[])
              .map((part: any) => {
                if (typeof part === "string") return part;
                if (part?.type === "output_text") return part.text ?? "";
                if ("text" in (part || {})) return part.text ?? "";
                return "";
              })
              .join("\n")
          : "";

    return reportText || "Unable to generate analysis report at this time.";
  } catch (error) {
    console.error("❌ OpenAI API error:", error);
    return `Analysis of your photo shows strong matches with the following phenotypes: ${matches
      .slice(0, 3)
      .map((m) => m.name)
      .join(", ")}. This suggests certain facial characteristics and structural features. Note: This is a computational analysis for educational purposes only.`;
  }
}
