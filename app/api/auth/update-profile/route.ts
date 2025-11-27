import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const connection = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("better-auth.session_token");

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user from session
    const sessions = await connection`
      SELECT "userId" FROM session
      WHERE token = ${sessionCookie.value}
        AND "expiresAt" > NOW()
    `;

    if (sessions.length === 0) {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    const userId = sessions[0].userId;
    const { name, email } = await request.json();

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await connection`
        SELECT id FROM "user"
        WHERE email = ${email} AND id != ${userId}
      `;

      if (existingUser.length > 0) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Update user
    await connection`
      UPDATE "user"
      SET
        name = COALESCE(${name}, name),
        email = COALESCE(${email}, email),
        "updatedAt" = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
