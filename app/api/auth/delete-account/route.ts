import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { compare } from "bcryptjs";

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
    const { password } = await request.json();

    // Verify password
    const accounts = await connection`
      SELECT password FROM account
      WHERE "userId" = ${userId} AND "providerId" = 'credential'
    `;

    if (accounts.length === 0) {
      return NextResponse.json(
        { message: "Account not found" },
        { status: 404 }
      );
    }

    const isValid = await compare(password, accounts[0].password);

    if (!isValid) {
      return NextResponse.json(
        { message: "Incorrect password" },
        { status: 400 }
      );
    }

    // Delete all user data (CASCADE will handle related records)
    await connection`DELETE FROM "user" WHERE id = ${userId}`;

    // Log deletion for compliance/audit
    console.log(`Account deleted: ${userId} at ${new Date().toISOString()}`);

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { message: "Failed to delete account" },
      { status: 500 }
    );
  }
}
