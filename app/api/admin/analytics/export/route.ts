import { NextRequest, NextResponse } from "next/server";
import { getOverallMetrics, getRevenueTrend } from "@/lib/analytics/overall-metrics";
import { getAffiliateMetrics } from "@/lib/analytics/affiliate-metrics";
import { getSubscriptionMetrics } from "@/lib/analytics/subscription-metrics";
import { getAdvertisingMetrics } from "@/lib/analytics/advertising-metrics";
import { generateRevenueCSV } from "@/lib/reports/export-csv";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Start and end dates are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    // Fetch all data
    const [overall, affiliate, subscription, advertising, revenueTrend] =
      await Promise.all([
        getOverallMetrics(startDate, endDate),
        getAffiliateMetrics(startDate, endDate),
        getSubscriptionMetrics(startDate, endDate),
        getAdvertisingMetrics(startDate, endDate),
        getRevenueTrend(startDate, endDate),
      ]);

    const csv = generateRevenueCSV({
      overall,
      affiliate,
      subscription,
      advertising,
      trends: { revenue: revenueTrend },
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="revenue-report-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
