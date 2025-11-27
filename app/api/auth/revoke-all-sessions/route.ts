import { NextRequest, NextResponse } from "next/server";
import { rawQuery as connection } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get current session
    const currentSession = await connection`
      SELECT "userId", id FROM session
      WHERE token = ${sessionCookie.value}
        AND "expiresAt" > NOW()
    `;

    if (currentSession.length === 0) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const userId = currentSession[0].userId;
    const currentSessionId = currentSession[0].id;

    // Delete all sessions except current one
    await connection`
      DELETE FROM session
      WHERE "userId" = ${userId}
        AND id != ${currentSessionId}
    `;

    return NextResponse.json({
      message: "All other sessions revoked successfully",
    });
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    return NextResponse.json(
      { message: "Failed to revoke sessions" },
      { status: 500 }
    );
  }
}
