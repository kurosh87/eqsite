import { NextRequest, NextResponse } from "next/server";
import { getOverallMetrics, getRevenueTrend } from "@/lib/analytics/overall-metrics";
import { getAffiliateMetrics, getAffiliateTrend } from "@/lib/analytics/affiliate-metrics";
import { getSubscriptionMetrics, getSubscriptionTrend } from "@/lib/analytics/subscription-metrics";
import { getAdvertisingMetrics, getAdvertisingTrend } from "@/lib/analytics/advertising-metrics";

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

    // Fetch all metrics in parallel
    const [overall, affiliate, subscription, advertising, revenueTrend] =
      await Promise.all([
        getOverallMetrics(startDate, endDate),
        getAffiliateMetrics(startDate, endDate),
        getSubscriptionMetrics(startDate, endDate),
        getAdvertisingMetrics(startDate, endDate),
        getRevenueTrend(startDate, endDate),
      ]);

    return NextResponse.json({
      overall,
      affiliate,
      subscription,
      advertising,
      trends: {
        revenue: revenueTrend,
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
