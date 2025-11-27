import { NextRequest, NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";
import { rawQuery as connection } from "@/lib/database";

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
    const { currentPassword, newPassword } = await request.json();

    // Get current password hash
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

    // Verify current password
    const currentHash = accounts[0].password;
    const isValid = await compare(currentPassword, currentHash);

    if (!isValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const newHash = await hash(newPassword, 10);

    // Update password
    await connection`
      UPDATE account
      SET password = ${newHash}, "updatedAt" = NOW()
      WHERE "userId" = ${userId} AND "providerId" = 'credential'
    `;

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { message: "Failed to change password" },
      { status: 500 }
    );
  }
}
