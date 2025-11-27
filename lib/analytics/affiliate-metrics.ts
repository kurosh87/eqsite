import { neon } from "@neondatabase/serverless";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

const connection = neon(process.env.DATABASE_URL!);

export interface AffiliateMetrics {
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  ctr: number;
  conversionRate: number;
  revenuePerClick: number;
  topRoutes: Array<{
    routeId: number;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
  partnerBreakdown: Array<{
    partner: string;
    clicks: number;
    conversions: number;
    revenue: number;
  }>;
}

export async function getAffiliateMetrics(
  startDate: Date,
  endDate: Date
): Promise<AffiliateMetrics> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Get overall metrics
  const overallMetrics = await connection`
    SELECT
      COUNT(*) as total_clicks,
      SUM(CASE WHEN converted = TRUE THEN 1 ELSE 0 END) as total_conversions,
      COALESCE(SUM(commission_amount), 0) as total_revenue
    FROM affiliate_clicks
    WHERE click_timestamp >= ${start} AND click_timestamp <= ${end}
  `;

  const metrics = overallMetrics[0];

  const totalClicks = Number(metrics?.total_clicks || 0);
  const totalConversions = Number(metrics?.total_conversions || 0);
  const totalRevenue = Number(metrics?.total_revenue || 0);

  // Calculate rates
  const ctr = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const conversionRate = ctr;
  const revenuePerClick = totalClicks > 0 ? totalRevenue / totalClicks : 0;

  // Get top routes
  const topRoutes = await connection`
    SELECT
      route_id,
      COUNT(*) as clicks,
      SUM(CASE WHEN converted = TRUE THEN 1 ELSE 0 END) as conversions,
      COALESCE(SUM(commission_amount), 0) as revenue
    FROM affiliate_clicks
    WHERE click_timestamp >= ${start}
      AND click_timestamp <= ${end}
      AND route_id IS NOT NULL
    GROUP BY route_id
    ORDER BY revenue DESC
    LIMIT 10
  `;

  // Get partner breakdown
  const partnerBreakdown = await connection`
    SELECT
      partner,
      COUNT(*) as clicks,
      SUM(CASE WHEN converted = TRUE THEN 1 ELSE 0 END) as conversions,
      COALESCE(SUM(commission_amount), 0) as revenue
    FROM affiliate_clicks
    WHERE click_timestamp >= ${start} AND click_timestamp <= ${end}
    GROUP BY partner
    ORDER BY revenue DESC
  `;

  return {
    totalClicks,
    totalConversions,
    totalRevenue,
    ctr: Number(ctr.toFixed(2)),
    conversionRate: Number(conversionRate.toFixed(2)),
    revenuePerClick: Number(revenuePerClick.toFixed(2)),
    topRoutes: (topRoutes as any[]).map((r) => ({
      routeId: Number(r.route_id),
      clicks: Number(r.clicks),
      conversions: Number(r.conversions),
      revenue: Number(r.revenue),
    })),
    partnerBreakdown: (partnerBreakdown as any[]).map((p) => ({
      partner: String(p.partner),
      clicks: Number(p.clicks),
      conversions: Number(p.conversions),
      revenue: Number(p.revenue),
    })),
  };
}

export async function getAffiliateTrend(
  startDate: Date,
  endDate: Date,
  interval: "day" | "week" | "month" = "day"
) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const dateFormat =
    interval === "day"
      ? "YYYY-MM-DD"
      : interval === "week"
      ? "YYYY-WW"
      : "YYYY-MM";

  const result = await connection`
    SELECT
      DATE(click_timestamp) as date,
      COUNT(*) as clicks,
      SUM(CASE WHEN converted = TRUE THEN 1 ELSE 0 END) as conversions,
      COALESCE(SUM(commission_amount), 0) as revenue
    FROM affiliate_clicks
    WHERE click_timestamp >= ${start} AND click_timestamp <= ${end}
    GROUP BY DATE(click_timestamp)
    ORDER BY date ASC
  `;

  return (result as any[]).map((r) => ({
    date: format(new Date(r.date), "MMM dd"),
    clicks: Number(r.clicks),
    conversions: Number(r.conversions),
    revenue: Number(r.revenue),
  }));
}
