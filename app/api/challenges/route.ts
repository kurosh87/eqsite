import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { dailyChallenges, dailyChallengeCompletions, userProfiles } from "@/app/schema/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// GET /api/challenges - Get active challenges and user progress
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Get active challenges (daily challenges serve as our challenge system)
    const activeChallenges = await db
      .select()
      .from(dailyChallenges)
      .where(
        and(
          gte(dailyChallenges.date, startOfWeek),
          lte(dailyChallenges.date, endOfWeek)
        )
      )
      .orderBy(desc(dailyChallenges.date));

    // Get user's completions
    const userCompletions = await db
      .select()
      .from(dailyChallengeCompletions)
      .where(eq(dailyChallengeCompletions.userId, session.user.id));

    const completedIds = new Set(userCompletions.map(c => c.challengeId));

    // Get user profile for stats
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    const userStats = profile[0] || {
      level: 1,
      xp: 0,
      currentStreak: 0,
      totalAssessments: 0,
      totalGamesPlayed: 0,
    };

    // Transform challenges with completion status
    const challengesWithStatus = activeChallenges.map(challenge => ({
      ...challenge,
      isCompleted: completedIds.has(challenge.id),
    }));

    return NextResponse.json({
      challenges: challengesWithStatus,
      userStats: {
        xp: userStats.xp,
        streak: userStats.currentStreak,
        completedThisWeek: userCompletions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

// POST /api/challenges - Complete a challenge
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { challengeId, response, score } = await request.json();

    if (!challengeId) {
      return NextResponse.json(
        { error: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Check if already completed
    const existing = await db
      .select()
      .from(dailyChallengeCompletions)
      .where(
        and(
          eq(dailyChallengeCompletions.userId, session.user.id),
          eq(dailyChallengeCompletions.challengeId, challengeId)
        )
      )
      .limit(1);

    if (existing[0]) {
      return NextResponse.json(
        { error: "Challenge already completed" },
        { status: 400 }
      );
    }

    // Get challenge details
    const challenge = await db
      .select()
      .from(dailyChallenges)
      .where(eq(dailyChallenges.id, challengeId))
      .limit(1);

    if (!challenge[0]) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Record completion
    const completion = await db
      .insert(dailyChallengeCompletions)
      .values({
        userId: session.user.id,
        challengeId,
        response,
        score,
      })
      .returning();

    // Award XP
    const xpEarned = challenge[0].xpReward;

    // Update user profile (XP will be handled by the existing function)
    // For now, return the completion
    return NextResponse.json({
      completion: completion[0],
      xpEarned,
    });
  } catch (error) {
    console.error("Error completing challenge:", error);
    return NextResponse.json(
      { error: "Failed to complete challenge" },
      { status: 500 }
    );
  }
}
