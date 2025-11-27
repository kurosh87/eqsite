import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { validateImageUrl } from "@/lib/url-validator";
import { checkAIRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { languages, type LanguageCode, isValidLanguageCode } from "@/lib/i18n/config";

const novitaApiKey = process.env.NOVITA_API_KEY;
const novitaBaseUrl = normalizeBaseUrl(
  process.env.NOVITA_BASE_URL || "https://api.novita.ai/openai"
);
const novitaModel = process.env.NOVITA_MODEL || "qwen/qwen3-vl-235b-a22b-instruct";

const novitaClient = novitaApiKey
  ? new OpenAI({
      apiKey: novitaApiKey,
      baseURL: novitaBaseUrl,
    })
  : null;

/**
 * Parse JSON from LLM response with repair capabilities for truncated responses
 */
function parseJsonResponse(rawContent: any): any {
  if (typeof rawContent === "object" && rawContent !== null) {
    return rawContent;
  }

  if (typeof rawContent !== "string") {
    return null;
  }

  try {
    return JSON.parse(rawContent);
  } catch (e) {
    console.error("Failed to parse rawContent as JSON:", e);

    // Try to repair truncated JSON
    let repairedJson = rawContent;

    // Count open/close braces and brackets
    const openBraces = (repairedJson.match(/\{/g) || []).length;
    const closeBraces = (repairedJson.match(/\}/g) || []).length;
    const openBrackets = (repairedJson.match(/\[/g) || []).length;
    const closeBrackets = (repairedJson.match(/\]/g) || []).length;

    // If truncated, try to close it properly
    if (openBraces > closeBraces || openBrackets > closeBrackets) {
      // Remove any incomplete string at the end (common truncation point)
      repairedJson = repairedJson.replace(/,?\s*"[^"]*$/, '');
      repairedJson = repairedJson.replace(/,?\s*$/, '');

      // Close any open brackets/braces
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        repairedJson += ']';
      }
      for (let i = 0; i < openBraces - closeBraces; i++) {
        repairedJson += '}';
      }

      try {
        return JSON.parse(repairedJson);
      } catch {
        // Repair failed, continue to fallback
      }
    }

    // Fallback: try to extract JSON from the string
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // JSON extraction failed
      }
    }

    return null;
  }
}

/**
 * Get language instruction for prompts
 */
function getLanguageInstruction(lang: LanguageCode): string {
  if (lang === "en") return "";
  const langInfo = languages[lang];
  return `\n\nIMPORTANT: Respond entirely in ${langInfo.name} (${langInfo.nativeName}). All text values in the JSON must be in ${langInfo.name}.`;
}

/**
 * Call 1: Core phenotype analysis - matches and basic info
 * Focused prompt for reliable, complete responses
 */
async function analyzePhenotypeCore(client: OpenAI, model: string, imageUrl: string, lang: LanguageCode = "en") {
  const languageInstruction = getLanguageInstruction(lang);
  const prompt = `Analyze facial features and identify ethnic phenotype matches.

Return STRICT JSON:
{
  "report": "Brief 2-3 sentence phenotype summary",
  "detailed_analysis": "5-7 sentence in-depth analysis of facial features, ancestral origins, and historical context",
  "facial_analysis": {
    "face_shape": "shape description",
    "eyes": "eye characteristics",
    "nose": "nose characteristics",
    "cheekbones": "cheekbone placement",
    "jaw": "jaw shape",
    "lips": "lip shape",
    "skin_tone": "tone and undertone"
  },
  "matches": [
    {
      "name": "ethnic group",
      "confidence": 0-100,
      "reason": "2-3 sentence explanation with specific features",
      "region": "geographic region",
      "morphology": "characteristic features",
      "historical_context": "brief background"
    }
  ],
  "genetic_heritage_summary": "1-2 sentence ancestry overview"
}

Rules:
- Return 3-5 matches ranked by confidence
- Include specific observable features as evidence${languageInstruction}`;

  const systemMessage = lang === "en"
    ? "You are an expert anthropologist. Return valid JSON only."
    : `You are an expert anthropologist. Return valid JSON only. Respond in ${languages[lang].name}.`;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    temperature: 0.2,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemMessage },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
          { type: "text", text: prompt },
        ],
      },
    ],
  } as any);

  return (completion as any).choices?.[0]?.message?.content;
}

/**
 * Call 2: Hierarchical ancestry composition - detailed breakdown
 * Separate call for complex nested structure
 */
async function analyzeAncestryComposition(client: OpenAI, model: string, imageUrl: string, lang: LanguageCode = "en") {
  const languageInstruction = getLanguageInstruction(lang);
  const prompt = `Analyze the person's likely ancestral composition based on facial features.

Return STRICT JSON:
{
  "ancestry_composition": [
    {
      "region": "Main continental region (European, Sub-Saharan African, East Asian, etc.)",
      "percentage": 0-100,
      "color": "#hex (use: #5AA9E6 European, #FF6B35 African, #7CB518 East Asian, #9B5DE5 Indigenous American, #F4A261 Middle Eastern, #E07A5F South Asian)",
      "subregions": [
        {
          "region": "Sub-region (Northwestern European, West African, etc.)",
          "percentage": 0-100,
          "populations": [
            {"name": "Population (British & Irish, Nigerian, etc.)", "percentage": 0-100}
          ]
        }
      ]
    }
  ],
  "haplogroups": {
    "paternal": {"haplogroup": "Y-DNA haplogroup", "description": "Origin and history"},
    "maternal": {"haplogroup": "mtDNA haplogroup", "description": "Origin and history"}
  }
}

Rules:
- Create 2-4 main regions
- Each region has 1-3 subregions
- Each subregion has 1-3 populations
- Percentages must total 100%
- Include "Broadly [Region]" for uncertain ancestry${languageInstruction}`;

  const systemMessage = lang === "en"
    ? "You are an expert geneticist. Return valid JSON only."
    : `You are an expert geneticist. Return valid JSON only. Respond in ${languages[lang].name}.`;

  const completion = await client.chat.completions.create({
    model,
    max_tokens: 2048,
    temperature: 0.2,
    top_p: 1,
    presence_penalty: 0,
    frequency_penalty: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemMessage },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl, detail: "high" } },
          { type: "text", text: prompt },
        ],
      },
    ],
  } as any);

  return (completion as any).choices?.[0]?.message?.content;
}

/**
 * Analyze endpoint using parallel API calls for better results.
 * Call 1: Core phenotype analysis (matches, facial analysis)
 * Call 2: Hierarchical ancestry composition (23andMe-style breakdown)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP address
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
               request.headers.get("x-real-ip") ||
               "anonymous";
    const rateLimit = await checkAIRateLimit(ip);

    if (!rateLimit.success) {
      return NextResponse.json(
        rateLimitResponse(rateLimit.remaining, rateLimit.reset),
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          }
        }
      );
    }

    if (!novitaClient) {
      return NextResponse.json(
        { error: "LLM unavailable. Set NOVITA_API_KEY to enable analysis." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const imageUrl = body?.imageUrl;
    const requestedLang = body?.language;

    // Validate language parameter, default to English
    const lang: LanguageCode = requestedLang && isValidLanguageCode(requestedLang)
      ? requestedLang
      : "en";

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    const urlValidation = validateImageUrl(imageUrl);
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }

    // Run both API calls in parallel for faster results
    const startTime = Date.now();

    const [coreResult, ancestryResult] = await Promise.all([
      analyzePhenotypeCore(novitaClient, novitaModel, imageUrl, lang),
      analyzeAncestryComposition(novitaClient, novitaModel, imageUrl, lang),
    ]);

    const duration = Date.now() - startTime;

    // Parse both responses
    const coreParsed = parseJsonResponse(coreResult);
    const ancestryParsed = parseJsonResponse(ancestryResult);

    // Extract matches with enhanced data from core result
    const matches =
      coreParsed?.matches && Array.isArray(coreParsed.matches)
        ? coreParsed.matches
            .filter(Boolean)
            .map((m: any) => ({
              name: m?.name || "unknown",
              confidence: typeof m?.confidence === "number" ? m.confidence : 0,
              reason: m?.reason || m?.reasoning || "",
              haplogroups: m?.haplogroups || { paternal: [], maternal: [] },
              region: m?.region || "",
              region_background: m?.region_background || "",
              haplogroup_notes: m?.haplogroup_notes || "",
              morphology: m?.morphology || "",
              population_genetics: m?.population_genetics || "",
              historical_context: m?.historical_context || "",
              famous_people: m?.famous_people || [],
              cultural_info: m?.cultural_info || null,
              climate_adaptation: m?.climate_adaptation || "",
              related_groups: m?.related_groups || [],
              health_traits: m?.health_traits || null,
            }))
        : [];

    const analysisText =
      (coreParsed?.report as string) ||
      (coreParsed?.analysis as string) ||
      renderContent(coreResult);

    // Extract data from core result
    const facialAnalysis = coreParsed?.facial_analysis || null;
    const detailedAnalysis = coreParsed?.detailed_analysis || "";
    const geneticHeritageSummary = coreParsed?.genetic_heritage_summary || "";

    // Extract data from ancestry result
    const ancestryComposition = ancestryParsed?.ancestry_composition || [];
    const haplogroups = ancestryParsed?.haplogroups || null;

    return NextResponse.json({
      analysisId: null,
      reportId: null,
      matches,
      aiReport: analysisText,
      detailedAnalysis,
      facialAnalysis,
      traitBreakdown: [],
      ancestryComposition,
      haplogroups,
      geneticHeritageSummary,
      migrationStory: "",
      rareTraits: [],
      confidenceFactors: null,
      scientificNotes: "",
      raw: { core: coreParsed, ancestry: ancestryParsed },
      uploadedImageUrl: imageUrl,
      llmProvider: "novita",
      apiCallDuration: duration,
      language: lang,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to analyze image", llmProvider: "novita" },
      { status: 500 }
    );
  }
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  if (trimmed.endsWith("/v1")) {
    return trimmed;
  }
  return `${trimmed}/v1`;
}

function renderContent(content: any): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part: any) => {
        if (typeof part === "string") return part;
        if (part?.type === "text") return part.text ?? "";
        if (part?.type === "output_text") return part.text ?? "";
        if ("text" in (part || {})) return (part as any).text ?? "";
        return "";
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  try {
    return JSON.stringify(content);
  } catch {
    return "LLM returned unrenderable content";
  }
}
