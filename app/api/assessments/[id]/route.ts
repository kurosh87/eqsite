import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getAssessmentById,
  getAssessmentResponses,
  saveAssessmentResponse,
  completeAssessment,
  calculateScores,
  calculatePercentile,
  getOrCreateUserProfile,
  updateUserProfile,
  addXp,
  updateStreak,
  checkAndAwardBadges,
  getEqDomains,
} from "@/lib/eq-database";

// GET /api/assessments/[id] - Get assessment details and results
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getAssessmentById(id);
    if (!result) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const { assessment, assessmentType } = result;

    // Check ownership
    if (assessment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get responses if completed
    let responses = null;
    if (assessment.status === "completed") {
      const responseData = await getAssessmentResponses(id);
      responses = responseData.map(({ response, question, domain }) => ({
        questionId: question.id,
        questionText: question.questionText,
        response: response.response,
        domain: domain.slug,
      }));
    }

    // Get domain details for scores
    const domains = await getEqDomains();
    const domainMap = Object.fromEntries(domains.map(d => [d.slug, d]));

    // Format domain scores with details
    let domainScoresWithDetails = null;
    if (assessment.domainScores) {
      domainScoresWithDetails = Object.entries(assessment.domainScores as Record<string, number>).map(
        ([slug, score]) => ({
          slug,
          name: domainMap[slug]?.name || slug,
          color: domainMap[slug]?.color || "#666",
          score,
        })
      );
    }

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        status: assessment.status,
        startedAt: assessment.startedAt,
        completedAt: assessment.completedAt,
        timeTaken: assessment.timeTaken,
        overallScore: assessment.overallScore,
        percentile: assessment.percentile,
        domainScores: domainScoresWithDetails,
        skillScores: assessment.skillScores,
      },
      assessmentType: {
        id: assessmentType.id,
        slug: assessmentType.slug,
        name: assessmentType.name,
      },
      responses,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// POST /api/assessments/[id] - Submit response or complete assessment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getAssessmentById(id);
    if (!result) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const { assessment } = result;

    // Check ownership
    if (assessment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if already completed
    if (assessment.status === "completed") {
      return NextResponse.json(
        { error: "Assessment already completed" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, questionId, response, responseTime, timeTaken } = body;

    // Submit a single response
    if (action === "submit_response") {
      if (!questionId || response === undefined) {
        return NextResponse.json(
          { error: "questionId and response are required" },
          { status: 400 }
        );
      }

      const savedResponse = await saveAssessmentResponse(
        id,
        questionId,
        response,
        responseTime
      );

      return NextResponse.json({
        success: true,
        responseId: savedResponse.id,
      });
    }

    // Complete the assessment
    if (action === "complete") {
      // Get all responses and calculate scores
      const responses = await getAssessmentResponses(id);

      if (responses.length === 0) {
        return NextResponse.json(
          { error: "No responses to score" },
          { status: 400 }
        );
      }

      const scores = calculateScores(responses);
      const percentile = await calculatePercentile(scores.overallScore);

      // Complete the assessment
      const completedAssessment = await completeAssessment(id, {
        ...scores,
        percentile,
        timeTaken,
      });

      // Update user profile stats
      const profile = await getOrCreateUserProfile(session.user.id);
      await updateUserProfile(session.user.id, {
        totalAssessments: profile.totalAssessments + 1,
      });

      // Award XP based on score (10-50 XP)
      const xpEarned = Math.round(10 + (scores.overallScore / 100) * 40);
      await addXp(session.user.id, xpEarned);

      // Update streak
      await updateStreak(session.user.id);

      // Check for new badges
      const newBadges = await checkAndAwardBadges(session.user.id);

      // Get domain details
      const domains = await getEqDomains();
      const domainMap = Object.fromEntries(domains.map(d => [d.slug, d]));

      const domainScoresWithDetails = Object.entries(scores.domainScores).map(
        ([slug, score]) => ({
          slug,
          name: domainMap[slug]?.name || slug,
          color: domainMap[slug]?.color || "#666",
          score,
        })
      );

      return NextResponse.json({
        success: true,
        assessment: {
          id: completedAssessment.id,
          status: completedAssessment.status,
          completedAt: completedAssessment.completedAt,
          overallScore: completedAssessment.overallScore,
          percentile: completedAssessment.percentile,
          domainScores: domainScoresWithDetails,
          timeTaken: completedAssessment.timeTaken,
        },
        rewards: {
          xpEarned,
          newBadges: newBadges.map(b => ({
            id: b.id,
            name: b.name,
            icon: b.icon,
          })),
        },
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error processing assessment:", error);
    return NextResponse.json(
      { error: "Failed to process assessment" },
      { status: 500 }
    );
  }
}
