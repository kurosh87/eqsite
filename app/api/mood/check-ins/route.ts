import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createEmotionCheckIn, getUserCheckIns } from "@/lib/eq-database";

// GET /api/mood/check-ins - Get user's mood check-ins
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "30");

    const checkIns = await getUserCheckIns(session.user.id, limit);

    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}

// POST /api/mood/check-ins - Create a new mood check-in
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emotion, intensity, secondaryEmotions, triggers, context, notes } = body;

    if (!emotion || !intensity) {
      return NextResponse.json(
        { error: "Emotion and intensity are required" },
        { status: 400 }
      );
    }

    if (intensity < 1 || intensity > 5) {
      return NextResponse.json(
        { error: "Intensity must be between 1 and 5" },
        { status: 400 }
      );
    }

    const checkIn = await createEmotionCheckIn(session.user.id, {
      emotion,
      intensity,
      secondaryEmotions,
      triggers,
      context,
      notes,
    });

    return NextResponse.json({ checkIn, xpEarned: 5 });
  } catch (error) {
    console.error("Error creating check-in:", error);
    return NextResponse.json(
      { error: "Failed to create check-in" },
      { status: 500 }
    );
  }
}
