import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { emotionCheckIns } from "@/app/schema/schema";
import { eq, desc, sql, gte } from "drizzle-orm";

// GET /api/mood/stats - Get mood statistics
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all check-ins for the user
    const checkIns = await db
      .select()
      .from(emotionCheckIns)
      .where(eq(emotionCheckIns.userId, session.user.id))
      .orderBy(desc(emotionCheckIns.createdAt));

    if (checkIns.length === 0) {
      return NextResponse.json({ stats: null });
    }

    // Calculate total and average intensity
    const totalCheckIns = checkIns.length;
    const totalIntensity = checkIns.reduce((sum, c) => sum + c.intensity, 0);
    const averageIntensity = totalIntensity / totalCheckIns;

    // Calculate emotion distribution
    const emotionCounts: Record<string, number> = {};
    for (const checkIn of checkIns) {
      emotionCounts[checkIn.emotion] = (emotionCounts[checkIn.emotion] || 0) + 1;
    }

    // Find most common emotion
    let mostCommonEmotion = "";
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonEmotion = emotion;
      }
    }

    // Calculate weekly trend (last 7 days, Mon-Sun)
    const weeklyTrend: number[] = [0, 0, 0, 0, 0, 0, 0];
    const weekCounts: number[] = [0, 0, 0, 0, 0, 0, 0];

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    for (const checkIn of checkIns) {
      const checkInDate = new Date(checkIn.createdAt);
      if (checkInDate >= oneWeekAgo) {
        // getDay returns 0 for Sunday, we want Monday as index 0
        const dayIndex = (checkInDate.getDay() + 6) % 7;
        weeklyTrend[dayIndex] += checkIn.intensity;
        weekCounts[dayIndex]++;
      }
    }

    // Calculate averages for each day
    for (let i = 0; i < 7; i++) {
      if (weekCounts[i] > 0) {
        weeklyTrend[i] = Math.round((weeklyTrend[i] / weekCounts[i]) * 10) / 10;
      }
    }

    return NextResponse.json({
      stats: {
        totalCheckIns,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        mostCommonEmotion,
        emotionDistribution: emotionCounts,
        weeklyTrend,
      },
    });
  } catch (error) {
    console.error("Error fetching mood stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
