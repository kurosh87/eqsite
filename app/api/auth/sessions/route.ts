import { NextRequest, NextResponse } from "next/server";
import { rawQuery as connection } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from current session
    const currentSession = await connection`
      SELECT "userId", id as "currentId" FROM session
      WHERE token = ${sessionCookie.value}
        AND "expiresAt" > NOW()
    `;

    if (currentSession.length === 0) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const userId = currentSession[0].userId;
    const currentId = currentSession[0].currentId;

    // Get all user sessions
    const sessions = await connection`
      SELECT
        id,
        "createdAt",
        "expiresAt",
        "ipAddress",
        "userAgent"
      FROM session
      WHERE "userId" = ${userId}
        AND "expiresAt" > NOW()
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({
      sessions: sessions.map((s) => ({
        ...s,
        isCurrent: s.id === currentId,
      })),
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { message: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
