import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { hash } from "bcryptjs";
import { createHash } from "crypto";

const connection = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Find valid reset token
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const resetTokens = await connection`
      SELECT pr."userId", pr.used, pr."expiresAt"
      FROM password_resets pr
      WHERE pr."tokenHash" = ${tokenHash}
        AND pr.used = FALSE
        AND pr."expiresAt" > NOW()
      LIMIT 1
    `;

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    const userId = resetTokens[0].userId;

    // Hash new password
    const hashedPassword = await hash(password, 10);

    // Update password in account table
    await connection`
      UPDATE account
      SET password = ${hashedPassword},
          "updatedAt" = NOW()
      WHERE "userId" = ${userId}
        AND "providerId" = 'credential'
    `;

    // Mark token as used
    await connection`
      UPDATE password_resets
      SET used = TRUE,
          "updatedAt" = NOW()
      WHERE "tokenHash" = ${tokenHash}
    `;

    // Invalidate all existing sessions for security
    await connection`
      DELETE FROM session WHERE "userId" = ${userId}
    `;

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
