import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getAssessmentTypes,
  getAssessmentTypeBySlug,
  createAssessment,
  getQuestionsForAssessment,
  getUserAssessments,
} from "@/lib/eq-database";

// GET /api/assessments - List assessment types or user's assessments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // If requesting user's assessments
    if (type === "history") {
      const session = await auth.api.getSession({ headers: await headers() });
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const limit = parseInt(searchParams.get("limit") || "10");
      const userAssessments = await getUserAssessments(session.user.id, limit);

      return NextResponse.json({
        assessments: userAssessments.map(({ assessment, assessmentType }) => ({
          id: assessment.id,
          type: assessmentType.name,
          typeSlug: assessmentType.slug,
          status: assessment.status,
          startedAt: assessment.startedAt,
          completedAt: assessment.completedAt,
          overallScore: assessment.overallScore,
          domainScores: assessment.domainScores,
          percentile: assessment.percentile,
        })),
      });
    }

    // Default: list assessment types
    const assessmentTypesList = await getAssessmentTypes();

    return NextResponse.json({
      assessmentTypes: assessmentTypesList.map((at) => ({
        id: at.id,
        slug: at.slug,
        name: at.name,
        description: at.description,
        questionCount: at.questionCount,
        estimatedMinutes: at.estimatedMinutes,
        isPremium: at.isPremium,
      })),
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

// POST /api/assessments - Start a new assessment
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentTypeSlug } = body;

    if (!assessmentTypeSlug) {
      return NextResponse.json(
        { error: "Assessment type slug is required" },
        { status: 400 }
      );
    }

    // Get the assessment type
    const assessmentType = await getAssessmentTypeBySlug(assessmentTypeSlug);
    if (!assessmentType) {
      return NextResponse.json(
        { error: "Assessment type not found" },
        { status: 404 }
      );
    }

    // Check if premium assessment and user has access
    // TODO: Add subscription check here

    // Create the assessment
    const assessment = await createAssessment(session.user.id, assessmentType.id);

    // Get questions for this assessment
    const questionsList = await getQuestionsForAssessment(assessmentTypeSlug);

    return NextResponse.json({
      assessment: {
        id: assessment.id,
        status: assessment.status,
        startedAt: assessment.startedAt,
      },
      assessmentType: {
        id: assessmentType.id,
        slug: assessmentType.slug,
        name: assessmentType.name,
        questionCount: assessmentType.questionCount,
        estimatedMinutes: assessmentType.estimatedMinutes,
      },
      questions: questionsList.map(({ question, domain, skill }) => ({
        id: question.id,
        text: question.questionText,
        type: question.questionType,
        scenario: question.scenario,
        options: question.options,
        domain: {
          slug: domain.slug,
          name: domain.name,
          color: domain.color,
        },
        skill: skill ? {
          slug: skill.slug,
          name: skill.name,
        } : null,
      })),
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}
