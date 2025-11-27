import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { formatApiError } from "@/lib/error-handler";
import { rawQuery as connection } from "@/lib/database";

/**
 * Get user profile with analysis stats
 */
export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create user_profiles table if it doesn't exist
    await connection`
      CREATE TABLE IF NOT EXISTS user_profiles (
        user_id text PRIMARY KEY,
        display_name text,
        bio text,
        avatar_url text,
        is_public boolean DEFAULT false,
        preferred_phenotypes jsonb,
        badges jsonb,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone,
        metadata jsonb
      )
    `;

    // Get or create profile
    let profile = await connection`
      SELECT * FROM user_profiles WHERE user_id = ${user.id}
    `;

    if (profile.length === 0) {
      // Create default profile
      profile = await connection`
        INSERT INTO user_profiles (user_id, display_name, created_at)
        VALUES (${user.id}, ${user.displayName || user.primaryEmail || 'User'}, NOW())
        RETURNING *
      `;
    }

    // Get user statistics
    const stats = await connection`
      SELECT
        COUNT(DISTINCT uu.id) as total_uploads,
        COUNT(DISTINCT ah.id) as total_analyses,
        COUNT(DISTINCT r.id) as total_reports,
        COUNT(DISTINCT CASE WHEN r.status = 'paid' THEN r.id END) as paid_reports,
        MIN(uu.created_at) as first_upload,
        MAX(uu.created_at) as last_upload
      FROM user_uploads uu
      LEFT JOIN analysis_history ah ON ah.user_id = uu.user_id
      LEFT JOIN reports r ON r.user_id = uu.user_id
      WHERE uu.user_id = ${user.id}
    `;

    // Calculate badges
    const badges = [];
    const totalAnalyses = parseInt(stats[0].total_analyses || '0');

    if (totalAnalyses >= 1) badges.push({ id: 'first_analysis', name: 'First Analysis', icon: '🎯' });
    if (totalAnalyses >= 10) badges.push({ id: 'explorer', name: 'Explorer', icon: '🔍' });
    if (totalAnalyses >= 50) badges.push({ id: 'researcher', name: 'Researcher', icon: '🔬' });
    if (parseInt(stats[0].paid_reports || '0') >= 1) badges.push({ id: 'premium', name: 'Premium User', icon: '⭐' });

    return NextResponse.json({
      profile: profile[0],
      stats: {
        totalUploads: parseInt(stats[0].total_uploads || '0'),
        totalAnalyses: parseInt(stats[0].total_analyses || '0'),
        totalReports: parseInt(stats[0].total_reports || '0'),
        paidReports: parseInt(stats[0].paid_reports || '0'),
        firstUpload: stats[0].first_upload,
        lastUpload: stats[0].last_upload,
      },
      badges,
    });
  } catch (error: any) {
    return NextResponse.json(
      formatApiError(error, "Failed to fetch profile."),
      { status: 500 }
    );
  }
}

/**
 * Update user profile
 */
export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();
    const { displayName, bio, isPublic } = body;

    // Update profile
    const updated = await connection`
      UPDATE user_profiles
      SET
        display_name = COALESCE(${displayName}, display_name),
        bio = COALESCE(${bio}, bio),
        is_public = COALESCE(${isPublic}, is_public),
        updated_at = NOW()
      WHERE user_id = ${user.id}
      RETURNING *
    `;

    if (updated.length === 0) {
      // Create if doesn't exist
      const created = await connection`
        INSERT INTO user_profiles (user_id, display_name, bio, is_public, created_at)
        VALUES (${user.id}, ${displayName || 'User'}, ${bio || ''}, ${isPublic || false}, NOW())
        RETURNING *
      `;
      return NextResponse.json({ profile: created[0] });
    }

    return NextResponse.json({ profile: updated[0] });
  } catch (error: any) {
    return NextResponse.json(
      formatApiError(error, "Failed to update profile."),
      { status: 500 }
    );
  }
}
