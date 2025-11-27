import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserAssessments, getEqDomains } from "@/lib/eq-database";

// GET /api/progress - Get user's progress data for charts
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "all";

    // Get all completed assessments
    const assessmentsData = await getUserAssessments(session.user.id, 100);
    const domains = await getEqDomains();

    // Filter by date range
    let filteredAssessments = assessmentsData
      .filter((a) => a.assessment.status === "completed" && a.assessment.overallScore !== null)
      .map((a) => ({
        id: a.assessment.id,
        completedAt: a.assessment.completedAt?.toISOString() || "",
        overallScore: a.assessment.overallScore || 0,
        domainScores: (a.assessment.domainScores as Record<string, number>) || {},
      }));

    if (range !== "all") {
      const now = new Date();
      const cutoff = new Date();
      if (range === "week") {
        cutoff.setDate(now.getDate() - 7);
      } else if (range === "month") {
        cutoff.setMonth(now.getMonth() - 1);
      }
      filteredAssessments = filteredAssessments.filter(
        (a) => new Date(a.completedAt) >= cutoff
      );
    }

    // Sort by date (oldest first for charts)
    filteredAssessments.sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    // Calculate stats
    const scores = filteredAssessments.map((a) => a.overallScore);
    const totalAssessments = filteredAssessments.length;
    const averageScore = totalAssessments > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / totalAssessments)
      : 0;
    const highestScore = totalAssessments > 0 ? Math.max(...scores) : 0;
    const lowestScore = totalAssessments > 0 ? Math.min(...scores) : 0;

    // Calculate improvement (first vs last assessment)
    let improvement = 0;
    if (filteredAssessments.length >= 2) {
      const first = filteredAssessments[0].overallScore;
      const last = filteredAssessments[filteredAssessments.length - 1].overallScore;
      improvement = last - first;
    }

    return NextResponse.json({
      assessments: filteredAssessments.reverse(), // Most recent first for display
      domains: domains.map((d) => ({
        slug: d.slug,
        name: d.name,
        color: d.color,
      })),
      stats: {
        totalAssessments,
        averageScore,
        highestScore,
        lowestScore,
        improvement,
      },
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
