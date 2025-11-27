import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  getUserStats,
  getUserBadges,
  getAllBadges,
  getOrCreateUserProfile,
  updateUserProfile,
} from "@/lib/eq-database";

// GET /api/user/stats - Get user stats, profile, and badges
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeBadges = searchParams.get("badges") === "true";

    const stats = await getUserStats(session.user.id);

    let badges: unknown[] | null = null;
    let earnedBadges: unknown[] | null = null;

    if (includeBadges) {
      const allBadges = await getAllBadges();
      const userBadges = await getUserBadges(session.user.id);
      const earnedIds = new Set(userBadges.map(ub => ub.badge.id));

      earnedBadges = userBadges.map(({ badge, userBadge }) => ({
        ...badge,
        earnedAt: userBadge.earnedAt,
      }));

      badges = allBadges.map(badge => ({
        ...badge,
        earned: earnedIds.has(badge.id),
        earnedAt: userBadges.find(ub => ub.badge.id === badge.id)?.userBadge.earnedAt || null,
      }));
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      profile: {
        level: stats.profile.level,
        xp: stats.profile.xp,
        xpToNextLevel: stats.profile.xpToNextLevel,
        currentStreak: stats.profile.currentStreak,
        longestStreak: stats.profile.longestStreak,
        lastActivityDate: stats.profile.lastActivityDate,
        totalAssessments: stats.profile.totalAssessments,
        totalGamesPlayed: stats.profile.totalGamesPlayed,
        totalExercisesCompleted: stats.profile.totalExercisesCompleted,
        focusAreas: stats.profile.focusAreas,
      },
      stats: {
        assessments: stats.assessments,
        badges: stats.badges,
      },
      badges: includeBadges ? badges : undefined,
      earnedBadges: includeBadges ? earnedBadges : undefined,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/stats - Update user profile preferences
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dailyReminderEnabled, reminderTime, focusAreas } = body;

    // Ensure profile exists
    await getOrCreateUserProfile(session.user.id);

    const updates: Record<string, unknown> = {};
    if (dailyReminderEnabled !== undefined) {
      updates.dailyReminderEnabled = dailyReminderEnabled;
    }
    if (reminderTime !== undefined) {
      updates.reminderTime = reminderTime;
    }
    if (focusAreas !== undefined) {
      updates.focusAreas = focusAreas;
    }

    const updated = await updateUserProfile(session.user.id, updates);

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
