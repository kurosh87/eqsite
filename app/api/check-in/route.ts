import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createEmotionCheckIn, getUserCheckIns } from "@/lib/eq-database";

// GET /api/check-in - Get user's check-in history
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30");

    const checkIns = await getUserCheckIns(session.user.id, limit);

    return NextResponse.json({
      checkIns: checkIns.map((ci) => ({
        id: ci.id,
        emotion: ci.emotion,
        intensity: ci.intensity,
        secondaryEmotions: ci.secondaryEmotions,
        triggers: ci.triggers,
        notes: ci.notes,
        context: ci.context,
        createdAt: ci.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

// POST /api/check-in - Create a new emotion check-in
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emotion, intensity, secondaryEmotions, triggers, notes, context } = body;

    if (!emotion || intensity === undefined) {
      return NextResponse.json(
        { error: "emotion and intensity are required" },
        { status: 400 }
      );
    }

    if (intensity < 1 || intensity > 5) {
      return NextResponse.json(
        { error: "intensity must be between 1 and 5" },
        { status: 400 }
      );
    }

    const checkIn = await createEmotionCheckIn(session.user.id, {
      emotion,
      intensity,
      secondaryEmotions,
      triggers,
      notes,
      context,
    });

    return NextResponse.json({
      success: true,
      checkIn: {
        id: checkIn.id,
        emotion: checkIn.emotion,
        intensity: checkIn.intensity,
        createdAt: checkIn.createdAt,
      },
      rewards: {
        xpEarned: 5,
      },
    });
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}
