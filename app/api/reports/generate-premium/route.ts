import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { getReportById } from "@/lib/database";
import { neon } from "@neondatabase/serverless";
import { generatePremiumReport, isPremiumReportsAvailable } from "@/lib/premium-reports";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { formatApiError } from "@/lib/error-handler";
import { logger } from "@/lib/logger";

const connection = neon(process.env.DATABASE_URL!);

/**
 * Generate full premium report with Anthropic Claude
 * Only available for paid reports or during preview
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting (premium report generation is expensive)
    const rateLimitResult = await checkRateLimit(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        rateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset),
        { status: 429 }
      );
    }

    // Get report ID from body
    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Verify report exists and belongs to user
    const report = await getReportById(reportId, user.id);

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Check if Anthropic API is available
    if (!isPremiumReportsAvailable()) {
      return NextResponse.json(
        { error: "Premium reports require Anthropic API configuration" },
        { status: 503 }
      );
    }

    // Get all phenotype matches for this report
    const primaryPhenotype = await connection`
      SELECT * FROM phenotypes WHERE id = ${report.primaryPhenotypeId}
    `;

    if (primaryPhenotype.length === 0) {
      return NextResponse.json(
        { error: "Primary phenotype not found" },
        { status: 404 }
      );
    }

    // Build matches array from report data
    const matches = [
      {
        id: report.primaryPhenotypeId,
        name: report.primaryPhenotypeName,
        description: report.primaryPhenotypeDescription,
        regions: [], // Would come from geographic_tags
        imageUrl: report.primaryPhenotypeImageUrl,
        similarity: 1.0,
      },
      ...(report.secondaryPhenotypes || []).map((sp: any) => ({
        id: sp.id,
        name: sp.name,
        regions: [],
        imageUrl: '',
        similarity: sp.similarity,
      })),
    ];

    // Generate premium report sections
    logger.debug("Generating premium report sections...");
    const sections = await generatePremiumReport(matches);

    // Save sections to database
    logger.debug("Saving report sections...");
    for (const section of sections) {
      await connection`
        INSERT INTO report_sections (report_id, section_type, content, generated_at)
        VALUES (
          ${reportId},
          ${section.sectionType},
          ${JSON.stringify({
            title: section.title,
            content: section.content,
            citations: section.citations,
          })}::jsonb,
          NOW()
        )
        ON CONFLICT (report_id, section_type)
        DO UPDATE SET
          content = EXCLUDED.content,
          generated_at = EXCLUDED.generated_at
      `;
    }

    // Mark report as complete
    await connection`
      UPDATE reports
      SET status = CASE WHEN status = 'paid' THEN 'complete' ELSE status END
      WHERE id = ${reportId}
    `;

    logger.debug("Premium report generated successfully");

    return NextResponse.json({
      success: true,
      reportId,
      sections: sections.map(s => ({
        type: s.sectionType,
        title: s.title,
        preview: s.content.substring(0, 200) + '...',
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      formatApiError(error, "Failed to generate premium report. Please try again."),
      { status: 500 }
    );
  }
}
