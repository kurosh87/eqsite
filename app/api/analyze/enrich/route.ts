import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

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

type EnrichmentSection =
  | "health_deep_dive"
  | "cultural_heritage"
  | "historical_migration"
  | "celebrity_lookalikes"
  | "genetic_traits"
  | "regional_cuisine"
  | "ancestor_letter"
  | "heritage_certificate"
  | "ancestral_names"
  | "cultural_calendar";

interface EnrichRequest {
  section: EnrichmentSection;
  topMatch: {
    name: string;
    region: string;
    confidence: number;
  };
  allMatches?: Array<{ name: string; confidence: number }>;
  imageUrl?: string;
}

const SECTION_PROMPTS: Record<EnrichmentSection, (data: EnrichRequest) => string> = {
  health_deep_dive: (data) => `
You are a genetic health expert. Based on this phenotype analysis showing ${data.topMatch.name} (${data.topMatch.region}) as the top match at ${data.topMatch.confidence}% confidence, provide an in-depth health and wellness report.

Return STRICT JSON:
{
  "title": "Health & Genetic Wellness Report",
  "subtitle": "Based on ${data.topMatch.name} phenotype analysis",

  "genetic_health_overview": "3-4 paragraph comprehensive overview of health characteristics associated with this population",

  "health_advantages": [
    {
      "trait": "trait name",
      "description": "2-3 sentences explaining the advantage",
      "prevalence": "percentage or frequency in population",
      "scientific_basis": "brief scientific explanation"
    }
  ],

  "health_considerations": [
    {
      "condition": "condition name",
      "risk_level": "slightly elevated/moderate/notable",
      "description": "2-3 sentences, presented sensitively",
      "prevention_tips": ["actionable tip 1", "tip 2"],
      "recommended_screenings": ["screening 1", "screening 2"]
    }
  ],

  "dietary_recommendations": {
    "foods_to_embrace": ["food 1 with reason", "food 2 with reason"],
    "foods_to_moderate": ["food 1 with reason"],
    "traditional_superfoods": ["traditional food from this culture with health benefits"],
    "lactose_tolerance": "likely tolerant/intolerant based on population genetics",
    "alcohol_metabolism": "typical metabolism pattern for this population"
  },

  "fitness_profile": {
    "athletic_strengths": ["strength 1", "strength 2"],
    "optimal_activities": ["activity suited to this phenotype"],
    "recovery_characteristics": "typical recovery patterns",
    "altitude_adaptation": "adaptation level to high altitude"
  },

  "skin_health": {
    "sun_sensitivity": "low/moderate/high with explanation",
    "aging_patterns": "typical aging characteristics",
    "recommended_care": ["skincare tip 1", "tip 2"]
  },

  "longevity_factors": {
    "blue_zone_connection": "any connection to longevity hotspots",
    "lifestyle_factors": ["factor contributing to longevity in this population"],
    "average_life_expectancy_context": "contextual information"
  },

  "recommended_genetic_tests": [
    {
      "test_name": "specific DNA test",
      "what_it_reveals": "what you'd learn",
      "why_relevant": "why it's relevant for this phenotype"
    }
  ],

  "disclaimer": "Brief medical disclaimer about phenotype-based health insights"
}

Be scientifically accurate, cite real population genetics research patterns, but present sensitively. Include 4-5 items per array.`,

  cultural_heritage: (data) => `
You are a cultural anthropologist. Create a rich cultural heritage guide for someone with ${data.topMatch.name} ancestry from ${data.topMatch.region}.

Return STRICT JSON:
{
  "title": "Cultural Heritage Deep Dive",
  "subtitle": "${data.topMatch.name} - ${data.topMatch.region}",

  "cultural_overview": "4-5 paragraph rich description of this culture's history, values, and contributions to world civilization",

  "traditional_customs": [
    {
      "name": "custom name",
      "description": "2-3 sentences",
      "significance": "cultural meaning",
      "still_practiced": true/false
    }
  ],

  "festivals_celebrations": [
    {
      "name": "festival name",
      "timing": "when it occurs",
      "description": "what happens",
      "traditional_foods": ["food 1", "food 2"],
      "significance": "cultural meaning"
    }
  ],

  "traditional_cuisine": {
    "signature_dishes": [
      {
        "name": "dish name",
        "description": "what it is",
        "ingredients": ["key ingredients"],
        "cultural_significance": "when/why it's eaten"
      }
    ],
    "cooking_techniques": ["technique 1", "technique 2"],
    "meal_traditions": "description of typical meal customs",
    "hospitality_customs": "how guests are traditionally treated"
  },

  "music_and_arts": {
    "traditional_music": ["genre/style 1", "genre 2"],
    "traditional_instruments": ["instrument 1", "instrument 2"],
    "dance_forms": ["dance 1 with description"],
    "visual_arts": ["art form 1", "art form 2"],
    "famous_artists": ["artist name - their contribution"]
  },

  "language_heritage": {
    "primary_languages": ["language 1", "language 2"],
    "common_phrases": [
      {"phrase": "phrase in original", "meaning": "English meaning", "pronunciation": "how to say it"}
    ],
    "naming_traditions": "how names are traditionally chosen",
    "common_surnames_meanings": [
      {"surname": "surname", "meaning": "what it means", "origin": "origin story"}
    ]
  },

  "family_values": {
    "family_structure": "typical family dynamics",
    "elder_respect": "how elders are treated",
    "marriage_traditions": "traditional marriage customs",
    "child_rearing": "traditional child-raising philosophies"
  },

  "places_to_visit": [
    {
      "name": "place name",
      "location": "specific location",
      "why_visit": "cultural significance",
      "best_time": "when to visit"
    }
  ],

  "connecting_with_heritage": [
    "Practical tip for connecting with this heritage",
    "Way to learn more about ancestry"
  ]
}

Include 4-6 items per array. Be specific, authentic, and celebratory of the culture.`,

  historical_migration: (data) => `
You are a historical geneticist. Create a detailed migration timeline and history for the ${data.topMatch.name} people from ${data.topMatch.region}.

Return STRICT JSON:
{
  "title": "Ancestral Migration Story",
  "subtitle": "The Journey of ${data.topMatch.name} Ancestors",

  "origin_story": "3-4 paragraph narrative about the ancient origins of this population",

  "migration_timeline": [
    {
      "period": "time period (e.g., '60,000-50,000 BCE')",
      "event": "what happened",
      "location_from": "starting location",
      "location_to": "destination",
      "description": "2-3 sentences about this migration",
      "evidence": "archaeological/genetic evidence",
      "climate_factors": "environmental conditions that drove migration"
    }
  ],

  "ancient_ancestors": [
    {
      "population": "ancestral population name (e.g., 'Neolithic Farmers')",
      "contribution": "percentage or significant/moderate/minor",
      "characteristics": "what traits came from this group",
      "time_of_admixture": "when this mixing occurred",
      "geographic_origin": "where they came from"
    }
  ],

  "key_historical_events": [
    {
      "date": "date or period",
      "event": "event name",
      "impact": "how it affected this population",
      "genetic_legacy": "any genetic impact from this event"
    }
  ],

  "diaspora_history": {
    "major_migrations": [
      {
        "period": "when",
        "destination": "where",
        "reason": "why",
        "population_size": "how many",
        "current_communities": "where descendants live today"
      }
    ],
    "global_distribution": "current worldwide distribution of this ethnicity"
  },

  "genetic_legacy": {
    "distinct_markers": ["genetic marker 1", "marker 2"],
    "haplogroup_story": "narrative about the Y-DNA and mtDNA haplogroups",
    "ancient_dna_discoveries": ["relevant ancient DNA finding"],
    "relation_to_other_groups": ["related population 1 - how related"]
  },

  "modern_identity": {
    "population_today": "estimated current population",
    "homeland_status": "current political/cultural status of traditional homeland",
    "cultural_preservation": "efforts to preserve heritage",
    "challenges_faced": "current challenges this population faces"
  },

  "your_place_in_history": "2-3 paragraph personalized narrative connecting the reader to this history"
}

Include 5-7 items in timeline. Be historically accurate and engaging.`,

  celebrity_lookalikes: (data) => `
You are a celebrity researcher and facial recognition expert. Find famous people who share ${data.topMatch.name} ancestry and similar phenotypic features from ${data.topMatch.region}.

Return STRICT JSON:
{
  "title": "Famous Faces Like Yours",
  "subtitle": "Celebrities with ${data.topMatch.name} Heritage",

  "celebrity_matches": [
    {
      "name": "celebrity full name",
      "profession": "what they're known for",
      "birth_year": "year born",
      "heritage": "their ethnic background",
      "shared_features": ["facial feature 1 you likely share", "feature 2"],
      "notable_achievements": ["achievement 1", "achievement 2"],
      "fun_fact": "interesting fact about them",
      "why_similar": "2-3 sentences explaining the phenotypic similarity"
    }
  ],

  "historical_figures": [
    {
      "name": "historical figure name",
      "era": "when they lived",
      "significance": "why they're famous",
      "heritage_connection": "connection to this ethnicity",
      "legacy": "their lasting impact"
    }
  ],

  "athletes": [
    {
      "name": "athlete name",
      "sport": "their sport",
      "achievements": ["achievement 1", "achievement 2"],
      "heritage": "ethnic background",
      "physical_traits": "notable physical characteristics"
    }
  ],

  "beauty_icons": [
    {
      "name": "name",
      "known_for": "what they're famous for",
      "signature_features": ["distinctive feature 1", "feature 2"],
      "heritage": "background"
    }
  ],

  "scientists_intellectuals": [
    {
      "name": "name",
      "field": "their field",
      "contribution": "major contribution",
      "heritage": "background"
    }
  ],

  "phenotype_traits_in_media": {
    "representation_in_film": "how this phenotype is represented in movies/TV",
    "beauty_standards": "how these features relate to beauty standards",
    "iconic_looks": ["iconic look 1 associated with this heritage"]
  }
}

Include 6-8 celebrities, 3-4 historical figures, 3-4 athletes, 3-4 beauty icons, 2-3 scientists. Use REAL, verifiable people only.`,

  genetic_traits: (data) => `
You are a geneticist specializing in human phenotypic variation. Provide a detailed breakdown of genetic traits for the ${data.topMatch.name} phenotype from ${data.topMatch.region}.

Return STRICT JSON:
{
  "title": "Genetic Trait Analysis",
  "subtitle": "Understanding Your ${data.topMatch.name} Genetic Heritage",

  "trait_deep_dive": [
    {
      "trait_category": "category (e.g., 'Eye Features', 'Facial Structure')",
      "traits": [
        {
          "name": "specific trait",
          "typical_expression": "how it typically appears in this population",
          "genetic_basis": "genes involved (e.g., 'OCA2, HERC2')",
          "inheritance_pattern": "dominant/recessive/polygenic",
          "variation_range": "spectrum of how this trait appears",
          "evolutionary_origin": "why this trait developed",
          "frequency": "how common in this population"
        }
      ]
    }
  ],

  "unique_combinations": {
    "description": "what makes this phenotype's combination of traits distinctive",
    "rare_combinations": ["rare trait combination 1"],
    "common_misconceptions": ["misconception about this phenotype"]
  },

  "environmental_adaptations": [
    {
      "adaptation": "adaptation name",
      "environment": "what environment it adapted to",
      "mechanism": "how it works",
      "genes_involved": ["gene 1", "gene 2"],
      "benefit": "survival advantage"
    }
  ],

  "trait_inheritance_predictions": {
    "dominant_traits": ["trait likely to pass to children"],
    "recessive_traits": ["trait that may skip generations"],
    "variable_traits": ["trait with unpredictable inheritance"]
  },

  "genetic_diversity": {
    "heterozygosity": "level of genetic diversity in this population",
    "founder_effects": "any founder effects in population history",
    "genetic_bottlenecks": "historical events that affected genetic diversity",
    "admixture_patterns": "mixing patterns with other populations"
  },

  "research_spotlight": [
    {
      "study": "research study or finding",
      "finding": "what was discovered",
      "relevance": "why it matters for this phenotype"
    }
  ]
}

Include 4-5 trait categories with 3-4 traits each. Be scientifically accurate.`,

  regional_cuisine: (data) => `
You are a culinary anthropologist. Create a comprehensive food and cuisine guide for ${data.topMatch.name} heritage from ${data.topMatch.region}.

Return STRICT JSON:
{
  "title": "Culinary Heritage Guide",
  "subtitle": "The Flavors of ${data.topMatch.name} Cuisine",

  "cuisine_overview": "3-4 paragraph introduction to this culinary tradition, its history, influences, and significance",

  "signature_dishes": [
    {
      "name": "dish name (include original language name)",
      "english_name": "English translation if applicable",
      "description": "what it is and how it tastes",
      "key_ingredients": ["ingredient 1", "ingredient 2"],
      "preparation_method": "how it's traditionally made",
      "when_eaten": "occasions or times when this is served",
      "regional_variations": "how it varies by region",
      "cultural_significance": "why this dish matters culturally",
      "difficulty": "easy/medium/hard to make at home"
    }
  ],

  "essential_ingredients": [
    {
      "ingredient": "ingredient name",
      "local_name": "name in local language",
      "importance": "why it's central to this cuisine",
      "flavor_profile": "what it tastes like",
      "health_benefits": "nutritional benefits",
      "substitutes": "what to use if unavailable"
    }
  ],

  "spice_cabinet": {
    "essential_spices": [
      {
        "spice": "spice name",
        "flavor": "flavor description",
        "uses": "how it's used",
        "origin": "where it comes from"
      }
    ],
    "signature_blends": ["spice blend 1 - ingredients and use"],
    "heat_level": "typical spice/heat level in this cuisine"
  },

  "meal_traditions": {
    "breakfast": "typical breakfast foods and customs",
    "lunch": "typical lunch",
    "dinner": "typical dinner and family customs",
    "snacks": ["common snacks"],
    "beverages": ["traditional drinks"],
    "eating_customs": "how meals are traditionally eaten"
  },

  "festive_foods": [
    {
      "occasion": "celebration or holiday",
      "dishes": ["special dish 1", "dish 2"],
      "significance": "why these foods are eaten then"
    }
  ],

  "street_food": [
    {
      "name": "street food name",
      "description": "what it is",
      "where_to_find": "typical places to find it",
      "price_range": "cheap/moderate/expensive"
    }
  ],

  "modern_fusion": {
    "contemporary_trends": "how this cuisine is evolving",
    "famous_chefs": ["chef name - their contribution"],
    "restaurants_worldwide": "notable restaurants serving this cuisine globally"
  },

  "recipes_to_try": [
    {
      "dish": "dish name",
      "difficulty": "beginner/intermediate/advanced",
      "time": "cooking time",
      "why_start_here": "why this is good for beginners"
    }
  ],

  "food_markets_to_visit": [
    {
      "name": "market name",
      "location": "where it is",
      "specialty": "what it's known for"
    }
  ]
}

Include 8-10 signature dishes, 6-8 essential ingredients, 5-6 spices. Be authentic and appetizing.`,

  ancestor_letter: (data) => `
You are a creative writer specializing in emotional, historically-informed narratives. Write a deeply personal letter as if from an ancestor of ${data.topMatch.name} heritage from ${data.topMatch.region}, speaking to their descendant today.

Return STRICT JSON:
{
  "title": "A Letter From Your Ancestors",
  "subtitle": "Across Time, We Are Connected",

  "letter": {
    "greeting": "My dearest descendant, child of my children's children...",
    "body": [
      "A deeply emotional 4-5 sentence paragraph about who they were, where they lived, what their daily life was like",
      "A 4-5 sentence paragraph about the struggles they faced - wars, famines, migrations, persecution - and how they persevered",
      "A 4-5 sentence paragraph about their hopes and dreams, what they wished for future generations",
      "A 4-5 sentence paragraph about the traditions, values, and wisdom they hope have been passed down",
      "A 4-5 sentence paragraph expressing pride in seeing their descendant today, acknowledging how far the family has come"
    ],
    "closing": "With all the love that transcends time and death, Your ancestors who live on in you",
    "signature": "Written in the spirit of the ${data.topMatch.name} people"
  },

  "ancestral_context": {
    "likely_time_period": "when your ancestors likely lived (e.g., '1800s-early 1900s')",
    "likely_location": "specific village/region they likely lived",
    "typical_occupation": "what work they likely did",
    "historical_events_witnessed": ["major historical event they lived through"],
    "challenges_faced": ["hardship 1", "hardship 2"],
    "what_they_valued": ["value 1", "value 2", "value 3"]
  },

  "their_legacy_in_you": {
    "physical_traits": "physical features you inherited from them",
    "cultural_traits": "cultural values or practices that may have been passed down",
    "resilience": "how their struggles made your life possible",
    "dreams_fulfilled": "ways you represent their hopes for the future"
  },

  "ancestor_profile": {
    "hypothetical_name": "A traditional ${data.topMatch.name} name they might have had",
    "life_span": "estimated birth-death years",
    "family_role": "their role in the family",
    "memorable_trait": "a personality trait they might have been known for"
  },

  "emotional_reflection": "A final 3-4 sentence reflection for the reader about honoring their ancestors and carrying their legacy forward"
}

Write with genuine emotion, historical accuracy, and deep respect. This should bring tears to readers' eyes. Make it personal and profound.`,

  heritage_certificate: (data) => `
You are creating official-sounding content for a Heritage Certificate. Generate formal, celebratory text for someone with ${data.topMatch.name} ancestry from ${data.topMatch.region} at ${data.topMatch.confidence}% confidence.

Return STRICT JSON:
{
  "certificate_title": "Certificate of Heritage",
  "official_declaration": "This document officially recognizes and celebrates the ancestral heritage of the bearer",

  "heritage_statement": "Be it known that the bearer of this certificate carries the proud genetic heritage of the ${data.topMatch.name} people, whose ancestors have walked the lands of ${data.topMatch.region} for countless generations.",

  "ancestry_declaration": {
    "primary_heritage": "${data.topMatch.name}",
    "geographic_origin": "${data.topMatch.region}",
    "confidence_level": "${data.topMatch.confidence}%",
    "analysis_date": "[Generate current date in format: Month Day, Year]",
    "certificate_number": "[Generate unique ID: PHN-${data.topMatch.confidence}-followed by 5 random alphanumeric characters]"
  },

  "heritage_rights": [
    "The right to claim ${data.topMatch.name} ancestry with pride",
    "The right to celebrate ${data.topMatch.name} cultural traditions",
    "The right to connect with ${data.topMatch.name} diaspora communities worldwide",
    "The right to explore the homeland of your ancestors",
    "The right to pass this heritage to future generations"
  ],

  "ancestral_blessing": "May you carry the strength, wisdom, and spirit of the ${data.topMatch.name} people in all that you do. May your ancestors smile upon you as you honor their legacy.",

  "heritage_motto": "A traditional saying or motto from this culture",
  "heritage_motto_translation": "English translation if applicable",

  "official_seal_text": "Phenotype Heritage Analysis",
  "verification_statement": "This heritage has been verified through advanced AI phenotype analysis of facial morphology and ancestral markers.",

  "closing_statement": "You are a living link in an unbroken chain stretching back thousands of years. Your face tells the story of your people."
}

Make it feel official, meaningful, and worth framing. This is something people will want to print and display.`,

  ancestral_names: (data) => `
You are a linguistics and cultural naming expert. Generate traditional names and naming information for someone with ${data.topMatch.name} heritage from ${data.topMatch.region}.

Return STRICT JSON:
{
  "title": "Your Ancestral Names",
  "subtitle": "Names You Might Have Carried",

  "traditional_names": {
    "male_names": [
      {
        "name": "traditional name",
        "pronunciation": "how to pronounce it",
        "meaning": "what it means",
        "origin": "origin/etymology",
        "famous_bearers": ["famous person with this name"],
        "popularity": "common/traditional/rare"
      }
    ],
    "female_names": [
      {
        "name": "traditional name",
        "pronunciation": "how to pronounce it",
        "meaning": "what it means",
        "origin": "origin/etymology",
        "famous_bearers": ["famous person with this name"],
        "popularity": "common/traditional/rare"
      }
    ],
    "unisex_names": [
      {
        "name": "name",
        "pronunciation": "pronunciation",
        "meaning": "meaning"
      }
    ]
  },

  "naming_traditions": {
    "how_names_chosen": "how names are traditionally selected in this culture",
    "naming_ceremony": "description of any naming ceremonies",
    "name_structure": "how names are structured (given name, patronymic, surname, etc.)",
    "nickname_traditions": "how nicknames are formed",
    "honorific_names": "titles or honorifics used"
  },

  "surname_analysis": {
    "common_surnames": [
      {
        "surname": "surname",
        "meaning": "what it means",
        "origin_type": "occupational/geographic/patronymic/descriptive",
        "region_associated": "specific region where common",
        "historical_note": "interesting historical fact"
      }
    ],
    "surname_patterns": "common patterns in surname formation",
    "noble_surnames": ["surname associated with nobility or prominence"]
  },

  "your_name_in_heritage": {
    "name_translation": "How to write a typical name in the native script/language",
    "writing_system": "what writing system is used",
    "calligraphy_note": "significance of written names in this culture"
  },

  "name_day_tradition": {
    "has_name_days": true/false,
    "explanation": "explanation of name day traditions if applicable",
    "how_celebrated": "how name days are celebrated"
  },

  "modern_trends": {
    "popular_modern_names": ["contemporary popular names in this culture"],
    "revival_names": ["old names making a comeback"],
    "diaspora_naming": "how naming changes in diaspora communities"
  }
}

Include 6-8 male names, 6-8 female names, 4-5 surnames. Use real, authentic names from this culture.`,

  cultural_calendar: (data) => `
You are a cultural celebrations expert. Create a personalized calendar of holidays and celebrations for someone with ${data.topMatch.name} heritage from ${data.topMatch.region}.

Return STRICT JSON:
{
  "title": "Your Heritage Calendar",
  "subtitle": "Celebrations of the ${data.topMatch.name} People",

  "introduction": "2-3 sentences about the importance of cultural celebrations in connecting with heritage",

  "major_holidays": [
    {
      "name": "holiday name (original and English)",
      "date": "when it occurs (fixed date or how determined)",
      "type": "religious/national/cultural/seasonal",
      "importance_level": "major/significant/traditional",
      "description": "2-3 sentences about what this holiday celebrates",
      "traditions": ["tradition 1", "tradition 2", "tradition 3"],
      "traditional_foods": ["special food 1", "food 2"],
      "traditional_greetings": [{"phrase": "greeting in original language", "pronunciation": "how to say it", "meaning": "English meaning"}],
      "how_to_celebrate_at_home": "practical ways to celebrate this even if far from homeland",
      "family_activities": ["activity 1", "activity 2"],
      "symbols": ["symbol 1", "symbol 2"],
      "colors": ["traditional color 1", "color 2"],
      "music_playlist": "type of music typically played"
    }
  ],

  "seasonal_celebrations": [
    {
      "season": "spring/summer/autumn/winter",
      "celebrations": ["celebration 1", "celebration 2"],
      "seasonal_foods": ["seasonal food"],
      "nature_connection": "how this season is viewed culturally"
    }
  ],

  "life_milestones": [
    {
      "milestone": "birth/coming of age/marriage/etc.",
      "traditional_celebration": "how this is traditionally celebrated",
      "key_rituals": ["ritual 1", "ritual 2"],
      "gifts": "traditional gifts given"
    }
  ],

  "weekly_traditions": {
    "special_day": "if there's a special day of the week",
    "family_traditions": "weekly family customs",
    "food_traditions": "weekly food customs"
  },

  "upcoming_celebrations": [
    {
      "name": "next upcoming celebration",
      "date": "specific date this year",
      "days_until": "approximately how many days away",
      "preparation_tips": ["how to prepare"]
    }
  ],

  "create_your_own_traditions": [
    "Suggestion for creating personal traditions that honor this heritage",
    "Way to involve family in heritage celebrations",
    "Simple daily practice to stay connected to roots"
  ],

  "heritage_calendar_pdf": {
    "suggested_wall_calendar_entries": [
      {"month": "January", "holidays": ["holiday in this month"]},
      {"month": "February", "holidays": []},
      {"month": "March", "holidays": []},
      {"month": "April", "holidays": []},
      {"month": "May", "holidays": []},
      {"month": "June", "holidays": []},
      {"month": "July", "holidays": []},
      {"month": "August", "holidays": []},
      {"month": "September", "holidays": []},
      {"month": "October", "holidays": []},
      {"month": "November", "holidays": []},
      {"month": "December", "holidays": []}
    ]
  }
}

Include 8-12 major holidays with complete details. Be accurate about dates and traditions. Make it practical for someone wanting to reconnect with their heritage.`
};

export async function POST(request: NextRequest) {
  try {
    if (!novitaClient) {
      return NextResponse.json(
        { error: "LLM unavailable. Set NOVITA_API_KEY to enable enrichment." },
        { status: 503 }
      );
    }

    const body: EnrichRequest = await request.json();
    const { section, topMatch, allMatches, imageUrl } = body;

    if (!section || !topMatch) {
      return NextResponse.json(
        { error: "section and topMatch are required" },
        { status: 400 }
      );
    }

    if (!SECTION_PROMPTS[section]) {
      return NextResponse.json(
        { error: `Invalid section: ${section}. Valid sections: ${Object.keys(SECTION_PROMPTS).join(", ")}` },
        { status: 400 }
      );
    }

    const prompt = SECTION_PROMPTS[section]({ section, topMatch, allMatches, imageUrl });

    const completion = await novitaClient.chat.completions.create({
      model: novitaModel,
      max_tokens: 16384, // Increased to avoid truncation of large JSON responses
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a helpful assistant that returns well-structured JSON. Always complete your JSON responses fully." },
        { role: "user", content: prompt },
      ],
    });

    const rawContent = (completion as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: "LLM returned empty content" },
        { status: 503 }
      );
    }

    let parsed: unknown = null;
    if (typeof rawContent === "string") {
      // Remove problematic control characters but preserve valid JSON whitespace
      // Keep: \t (0x09), \n (0x0A), \r (0x0D) - these are valid JSON whitespace
      // Remove: other control chars (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F)
      const sanitizedContent = rawContent
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

      try {
        parsed = JSON.parse(sanitizedContent);
      } catch {
        // Try to repair truncated JSON
        let repairedJson = sanitizedContent.trim();

        // Remove any markdown code blocks
        repairedJson = repairedJson.replace(/^```json\s*/i, "").replace(/```\s*$/, "");

        // Extract JSON if wrapped in other text
        const jsonMatch = repairedJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          repairedJson = jsonMatch[0];
        }

        // Count and balance braces/brackets
        const openBraces = (repairedJson.match(/\{/g) || []).length;
        const closeBraces = (repairedJson.match(/\}/g) || []).length;
        const openBrackets = (repairedJson.match(/\[/g) || []).length;
        const closeBrackets = (repairedJson.match(/\]/g) || []).length;

        // Check for unterminated strings
        const lastQuote = repairedJson.lastIndexOf('"');
        const afterLastQuote = repairedJson.slice(lastQuote + 1);
        if (lastQuote > 0 && !afterLastQuote.match(/[,\}\]:]/) && afterLastQuote.trim() !== "") {
          // Truncated in middle of a string - close it
          repairedJson = repairedJson.slice(0, lastQuote + 1);
          // Add closing quote if needed
          const beforeLastQuote = repairedJson.slice(0, lastQuote);
          const quoteCount = (beforeLastQuote.match(/(?<!\\)"/g) || []).length;
          if (quoteCount % 2 === 0) {
            repairedJson += '"';
          }
        }

        // Close any unclosed brackets and braces
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
          repairedJson += "]";
        }
        for (let i = 0; i < openBraces - closeBraces; i++) {
          repairedJson += "}";
        }

        try {
          parsed = JSON.parse(repairedJson);
          console.log("Successfully repaired truncated JSON in enrichment response");
        } catch (repairError) {
          console.error("Failed to repair JSON from enrichment response:", repairError);
          console.error("Repaired JSON preview (first 200 chars):", repairedJson.slice(0, 200));
          console.error("Original content preview (first 200 chars):", rawContent.slice(0, 200));
        }
      }
    } else if (typeof rawContent === "object" && rawContent !== null) {
      parsed = rawContent;
    }

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse enrichment response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      section,
      data: parsed,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate enrichment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function normalizeBaseUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, "");
  if (trimmed.endsWith("/v1")) {
    return trimmed;
  }
  return `${trimmed}/v1`;
}
