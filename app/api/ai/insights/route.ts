import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserAssessments, getEqDomains, getSkillsForDomain } from "@/lib/eq-database";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// GET /api/ai/insights - Get AI-generated insights based on user's EQ data
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!anthropic) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    // Get user's assessment history
    const assessmentsData = await getUserAssessments(session.user.id, 10);
    const domains = await getEqDomains();

    const completedAssessments = assessmentsData
      .filter((a) => a.assessment.status === "completed" && a.assessment.overallScore !== null)
      .map((a) => ({
        date: a.assessment.completedAt?.toISOString().split("T")[0],
        overallScore: a.assessment.overallScore,
        domainScores: a.assessment.domainScores as Record<string, number>,
      }));

    if (completedAssessments.length === 0) {
      return NextResponse.json({
        insights: null,
        message: "Complete an assessment to receive personalized AI insights",
      });
    }

    // Get skills for weak domains
    const latestAssessment = completedAssessments[0];
    const domainScores = latestAssessment.domainScores || {};

    // Find weakest and strongest domains
    const sortedDomains = Object.entries(domainScores)
      .sort(([, a], [, b]) => a - b);

    const weakestDomain = sortedDomains[0];
    const strongestDomain = sortedDomains[sortedDomains.length - 1];

    // Get skills for weak domain
    const weakDomainData = domains.find((d) => d.slug === weakestDomain?.[0]);
    const weakDomainSkills = weakDomainData
      ? await getSkillsForDomain(weakDomainData.id)
      : [];

    // Build context for AI
    const context = {
      userName: session.user.name || "User",
      totalAssessments: completedAssessments.length,
      latestScore: latestAssessment.overallScore,
      domainScores: domainScores,
      weakestDomain: weakestDomain ? {
        name: weakDomainData?.name || weakestDomain[0],
        score: weakestDomain[1],
        skills: weakDomainSkills.map((s) => s.name),
      } : null,
      strongestDomain: strongestDomain ? {
        name: domains.find((d) => d.slug === strongestDomain[0])?.name || strongestDomain[0],
        score: strongestDomain[1],
      } : null,
      trend: completedAssessments.length >= 2
        ? completedAssessments[0].overallScore! - completedAssessments[completedAssessments.length - 1].overallScore!
        : 0,
    };

    // Generate AI insights
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an empathetic EQ coach. Based on the following user data, provide personalized insights and actionable advice. Be warm, encouraging, and specific.

User Data:
- Name: ${context.userName}
- Latest EQ Score: ${context.latestScore}%
- Total Assessments Completed: ${context.totalAssessments}
- Domain Scores: ${JSON.stringify(context.domainScores, null, 2)}
- Weakest Area: ${context.weakestDomain?.name} (${context.weakestDomain?.score}%)
- Strongest Area: ${context.strongestDomain?.name} (${context.strongestDomain?.score}%)
- Skills to improve in weakest area: ${context.weakestDomain?.skills?.join(", ")}
- Overall trend: ${context.trend > 0 ? `+${context.trend}% improvement` : context.trend < 0 ? `${context.trend}% decline` : "stable"}

Please provide:
1. A brief, encouraging summary (2-3 sentences)
2. Your top strength and how to leverage it
3. Your main growth area and 2-3 specific exercises
4. One actionable tip for today

Format your response as JSON with these keys:
{
  "summary": "...",
  "strength": { "title": "...", "description": "..." },
  "growthArea": { "title": "...", "exercises": ["...", "...", "..."] },
  "dailyTip": "..."
}`,
        },
      ],
    });

    // Parse AI response
    const textContent = response.content[0];
    if (textContent.type !== "text") {
      throw new Error("Unexpected response format");
    }

    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }

    const insights = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      insights,
      context: {
        latestScore: context.latestScore,
        weakestDomain: context.weakestDomain?.name,
        strongestDomain: context.strongestDomain?.name,
        trend: context.trend,
      },
    });
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}

// POST /api/ai/insights - Ask AI a specific question
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!anthropic) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    const { question, context } = await request.json();

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: `You are a warm, knowledgeable EQ coach helping users improve their emotional intelligence.
Keep responses concise (2-3 paragraphs max), practical, and encouraging.
If given user context, personalize your advice based on their scores and progress.`,
      messages: [
        {
          role: "user",
          content: context
            ? `User context: ${JSON.stringify(context)}\n\nQuestion: ${question}`
            : question,
        },
      ],
    });

    const textContent = response.content[0];
    if (textContent.type !== "text") {
      throw new Error("Unexpected response format");
    }

    return NextResponse.json({
      answer: textContent.text,
    });
  } catch (error) {
    console.error("Error getting AI response:", error);
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
