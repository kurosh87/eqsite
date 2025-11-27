import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { journalEntries } from "@/app/schema/schema";
import { eq, and } from "drizzle-orm";

// GET /api/journal/[id] - Get a specific journal entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const entries = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, session.user.id)
        )
      )
      .limit(1);

    if (!entries[0]) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ entry: entries[0] });
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return NextResponse.json(
      { error: "Failed to fetch entry" },
      { status: 500 }
    );
  }
}

// PATCH /api/journal/[id] - Update a journal entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, mood, moodScore, emotions, tags } = body;

    // Verify ownership
    const existing = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const updates: Partial<typeof journalEntries.$inferInsert> = {};
    if (title !== undefined) updates.title = title?.trim() || null;
    if (content !== undefined) {
      updates.content = content.trim();
      updates.wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    }
    if (mood !== undefined) updates.mood = mood;
    if (moodScore !== undefined) updates.moodScore = moodScore;
    if (emotions !== undefined) updates.emotions = emotions;
    if (tags !== undefined) updates.tags = tags;

    const result = await db
      .update(journalEntries)
      .set(updates)
      .where(eq(journalEntries.id, id))
      .returning();

    return NextResponse.json({ entry: result[0] });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/journal/[id] - Delete a journal entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await db.delete(journalEntries).where(eq(journalEntries.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
