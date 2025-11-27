import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { neon } from "@neondatabase/serverless";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { formatApiError, validateRequiredFields } from "@/lib/error-handler";

const connection = neon(process.env.DATABASE_URL!);

/**
 * User feedback endpoint
 * Collects feedback on analysis accuracy and app experience
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        rateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset),
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const validation = validateRequiredFields(body, ['analysisId', 'feedbackType']);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const {
      analysisId,
      feedbackType, // 'accurate', 'somewhat_accurate', 'inaccurate', 'very_inaccurate'
      rating, // 1-5 stars
      comment,
      wasHelpful,
    } = body;

    // Create feedback table if it doesn't exist
    await connection`
      CREATE TABLE IF NOT EXISTS user_feedback (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id text NOT NULL,
        analysis_id uuid,
        report_id uuid,
        feedback_type text NOT NULL,
        rating integer,
        comment text,
        was_helpful boolean,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        metadata jsonb
      )
    `;

    // Save feedback
    const result = await connection`
      INSERT INTO user_feedback (
        user_id,
        analysis_id,
        feedback_type,
        rating,
        comment,
        was_helpful,
        metadata,
        created_at
      )
      VALUES (
        ${user.id},
        ${analysisId},
        ${feedbackType},
        ${rating || null},
        ${comment || null},
        ${wasHelpful || null},
        ${JSON.stringify({ userAgent: request.headers.get('user-agent') })}::jsonb,
        NOW()
      )
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      feedbackId: result[0].id,
      message: "Thank you for your feedback!",
    });
  } catch (error: any) {
    return NextResponse.json(
      formatApiError(error, "Failed to submit feedback. Please try again."),
      { status: 500 }
    );
  }
}

/**
 * Get aggregated feedback statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin (you'll need to implement admin check)
    // For now, just return user's own feedback

    const feedback = await connection`
      SELECT
        feedback_type,
        COUNT(*) as count,
        AVG(rating) as avg_rating
      FROM user_feedback
      WHERE user_id = ${user.id}
      GROUP BY feedback_type
      ORDER BY count DESC
    `;

    return NextResponse.json({ feedback });
  } catch (error: any) {
    return NextResponse.json(
      formatApiError(error, "Failed to fetch feedback."),
      { status: 500 }
    );
  }
}
