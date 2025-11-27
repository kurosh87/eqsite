import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { journalEntries } from "@/app/schema/schema";
import { eq, desc } from "drizzle-orm";
import { addXp, updateStreak } from "@/lib/eq-database";

// GET /api/journal - Get user's journal entries
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");

    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, session.user.id))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

// POST /api/journal - Create a new journal entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, mood, moodScore, emotions, tags, promptId, promptText } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const result = await db
      .insert(journalEntries)
      .values({
        userId: session.user.id,
        title: title?.trim() || null,
        content: content.trim(),
        mood,
        moodScore,
        emotions,
        tags,
        promptId,
        promptText,
        wordCount,
      })
      .returning();

    // Award XP based on word count
    const xpEarned = Math.min(Math.floor(wordCount / 10) + 10, 50); // 10-50 XP
    await addXp(session.user.id, xpEarned);
    await updateStreak(session.user.id);

    return NextResponse.json({
      entry: result[0],
      xpEarned,
    });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
