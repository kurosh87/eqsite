import { NextRequest, NextResponse } from "next/server";
import { rawQuery as connection } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await request.json();

    // Get current user
    const currentSession = await connection`
      SELECT "userId" FROM session
      WHERE token = ${sessionCookie.value}
        AND "expiresAt" > NOW()
    `;

    if (currentSession.length === 0) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const userId = currentSession[0].userId;

    // Delete the specified session (but only if it belongs to this user)
    await connection`
      DELETE FROM session
      WHERE id = ${sessionId}
        AND "userId" = ${userId}
    `;

    return NextResponse.json({ message: "Session revoked successfully" });
  } catch (error) {
    console.error("Revoke session error:", error);
    return NextResponse.json(
      { message: "Failed to revoke session" },
      { status: 500 }
    );
  }
}
