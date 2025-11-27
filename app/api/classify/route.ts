import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkAIRateLimit, rateLimitResponse } from "@/lib/rate-limit";

// Base phenotypes with geographic regions
const BASE_PHENOTYPES: Record<string, string> = {
  // European
  "Nordid": "Northern Europe (Scandinavia, Baltic)",
  "Mediterranid": "Southern Europe (Mediterranean coast)",
  "Alpinid": "Central Europe (Alps region)",
  "Dinarid": "Southeastern Europe (Balkans)",
  "EastEuropid": "Eastern Europe (Slavic regions)",
  "Atlantid": "Western Europe (Atlantic coast)",

  // East Asian
  "Sinid": "East Asia (China, Korea, Japan)",
  "SouthMongolid": "Southeast Asia (Vietnam, Thailand)",
  "Tungid": "Northeast Asia (Manchuria, Mongolia)",
  "Sibirid": "Siberia, Central Asia",

  // South Asian
  "Indid": "South Asia (India, Pakistan)",
  "Veddid": "South India, Sri Lanka",
  "IndoMelanid": "Eastern India, Bangladesh",

  // Middle Eastern / North African
  "Orientalid": "Middle East (Levant, Arabia)",
  "Armenoid": "Caucasus, Eastern Anatolia",
  "Arabid": "Arabian Peninsula",
  "Berberid": "North Africa (Maghreb)",

  // Sub-Saharan African
  "Ethiopid": "East Africa (Horn of Africa)",
  "Nilotid": "East Africa (Nile Valley)",
  "Congolid": "Central Africa (Congo Basin)",
  "Bantuid": "Southern/Eastern Africa",
  "Sudanid": "West Africa (Sahel)",
  "Khoid": "Southern Africa (Khoisan)",
  "Sanid": "Southern Africa (San peoples)",

  // Southeast Asian / Pacific
  "Malayid": "Southeast Asia (Malaysia, Indonesia)",
  "Polynesid": "Polynesia (Pacific Islands)",
  "Melanesid": "Melanesia (Papua, Solomon Islands)",
  "Australid": "Australia (Aboriginal)",
  "Negritid": "Southeast Asia (Andaman, Philippines)",

  // Native American
  "Amazonid": "South America (Amazon Basin)",
  "Andid": "South America (Andes)",
  "Centralid": "Central America",
  "Silvid": "North America (Eastern Woodlands)",
  "Pacifid": "North America (Pacific Coast)",
  "Margid": "South America (Southern Cone)",

  // Other
  "Ainuid": "Japan (Ainu people)",
  "Lappid": "Northern Scandinavia (Sami)",
  "Eskimid": "Arctic (Inuit, Yupik)",
  "Turanid": "Central Asia (Turkic peoples)",
};

function buildPhenotypeList(): string {
  return Object.entries(BASE_PHENOTYPES)
    .map(([name, region]) => `- ${name}: ${region}`)
    .join("\n");
}

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

    const body = await request.json();
    const { imageUrl, skipValidation } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
    if (!hfToken) {
      return NextResponse.json(
        { error: "HuggingFace token not configured" },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: hfToken,
    });

    // Optional: Validate image first
    if (!skipValidation) {
      const validationPrompt = `Analyze this image quickly:
1. Is this a human face/portrait photo? (yes/no)
2. Is it appropriate/safe for work? (yes/no)
3. Is the face clearly visible? (yes/no)

Return ONLY JSON: {"is_face": true/false, "is_appropriate": true/false, "is_clear": true/false, "issue": "reason if any problem, null if ok"}`;

      try {
        const validationResult = await client.chat.completions.create({
          model: "Qwen/Qwen3-VL-30B-A3B-Instruct",
          messages: [{
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              { type: "text", text: validationPrompt }
            ]
          }],
          max_tokens: 200,
          temperature: 0.1
        });

        let validationText = validationResult.choices[0]?.message?.content || "";
        if (validationText.includes("```")) {
          validationText = validationText.split("```")[1].split("```")[0].trim();
          if (validationText.startsWith("json")) {
            validationText = validationText.slice(4).trim();
          }
        }

        const validation = JSON.parse(validationText);
        if (!validation.is_face || !validation.is_appropriate || !validation.is_clear) {
          return NextResponse.json({
            error: true,
            message: validation.issue || "Image validation failed",
            validation
          }, { status: 400 });
        }
      } catch (validationError) {
        console.warn("Validation error (proceeding anyway):", validationError);
      }
    }

    // Classification prompt
    const phenotypeList = buildPhenotypeList();
    const classificationPrompt = `You are an expert forensic anthropologist. Analyze this portrait and classify the person's phenotype.

**PHENOTYPE DATABASE:**
${phenotypeList}

**TASK:** Analyze facial features and provide phenotype classification.

**ANALYZE:**
1. Cranial shape (round/elongated/medium)
2. Facial profile (flat/projected/intermediate)
3. Nose shape (wide/narrow/medium, bridge height)
4. Eye shape (epicanthic fold presence, eye opening shape)
5. Skin tone (very light to very dark)
6. Hair texture (straight/wavy/curly/coily)
7. Lip fullness (thin/medium/full)
8. Cheekbone prominence (high/low/medium)

**OUTPUT:** Return ONLY valid JSON:
{
  "primary_phenotype": "<name from database>",
  "confidence": <0-100>,
  "secondary_phenotypes": ["<name>", "<name>"],
  "geographic_region": "<region>",
  "facial_features": {
    "cranial_shape": "<description>",
    "facial_profile": "<description>",
    "nose": "<description>",
    "eyes": "<description>",
    "skin_tone": "<description>",
    "hair": "<description>",
    "lips": "<description>",
    "cheekbones": "<description>"
  },
  "reasoning": "<brief explanation of classification>"
}`;

    const classificationResult = await client.chat.completions.create({
      model: "Qwen/Qwen3-VL-30B-A3B-Instruct",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: classificationPrompt }
        ]
      }],
      max_tokens: 1000,
      temperature: 0.2
    });

    let resultText = classificationResult.choices[0]?.message?.content || "";

    // Parse JSON from response
    if (resultText.includes("```")) {
      resultText = resultText.split("```")[1].split("```")[0].trim();
      if (resultText.startsWith("json")) {
        resultText = resultText.slice(4).trim();
      }
    }

    const result = JSON.parse(resultText);
    result.model = "Qwen/Qwen3-VL-30B-A3B-Instruct";
    result.imageUrl = imageUrl;

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "Classification failed", details: error.message },
      { status: 500 }
    );
  }
}
