import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { createHash, randomBytes } from "crypto";
import { checkRateLimit, passwordResetRateLimit } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

const connection = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Rate limiting (with error handling)
    if (passwordResetRateLimit) {
      try {
        const ip = request.headers.get("x-forwarded-for") || "anonymous";
        const { success, limit, remaining, reset } = await passwordResetRateLimit.limit(ip);

        if (!success) {
          return NextResponse.json(
            {
              message: `Too many requests. Try again in ${Math.ceil((reset - Date.now()) / 60000)} minutes`,
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": limit.toString(),
                "X-RateLimit-Remaining": remaining.toString(),
                "X-RateLimit-Reset": new Date(reset).toISOString(),
              },
            }
          );
        }
      } catch (rateLimitError) {
        console.error("Rate limit check failed, continuing without rate limit:", rateLimitError);
        // Continue without rate limiting if it fails
      }
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const users = await connection`
      SELECT id FROM "user" WHERE email = ${email}
    `;

    if (users.length === 0) {
      // Don't reveal if email exists
      return NextResponse.json({
        message: "If that email exists, we've sent a reset link",
      });
    }

    const userId = users[0].id;

    // Generate reset token
    const token = randomBytes(32).toString("hex");
    const id = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token (schema: id, userId, token, expiresAt, used, createdAt)
    await connection`
      INSERT INTO password_resets (id, "userId", token, "expiresAt", used, "createdAt")
      VALUES (${id}, ${userId}, ${token}, ${expiresAt}, false, NOW())
    `;

    const resetUrl = `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    // Get user name for personalized email
    const userInfo = await connection`
      SELECT name FROM "user" WHERE id = ${userId}
    `;
    const userName = userInfo[0]?.name;

    // Send password reset email
    try {
      await sendPasswordResetEmail(email, resetUrl, userName);
      console.log(`Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error(`Failed to send password reset email to ${email}:`, emailError);
      // Still return success to not reveal if email exists
    }

    return NextResponse.json({
      message: "If that email exists, we've sent a reset link",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        message: "Failed to process request",
        // Only include error details in development
        ...(process.env.NODE_ENV === "development" && { error: error?.message }),
      },
      { status: 500 }
    );
  }
}
