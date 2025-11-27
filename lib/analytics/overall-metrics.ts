import { neon } from "@neondatabase/serverless";
import { startOfDay, endOfDay, subDays, differenceInDays, format } from "date-fns";

const connection = neon(process.env.DATABASE_URL!);
import { getAffiliateMetrics } from "./affiliate-metrics";
import { getSubscriptionMetrics } from "./subscription-metrics";
import { getAdvertisingMetrics } from "./advertising-metrics";

export interface OverallMetrics {
  totalRevenue: number;
  affiliateRevenue: number;
  subscriptionRevenue: number;
  advertisingRevenue: number;
  revenuePerUser: number;
  totalUsers: number;
  activeUsers: number;
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  ltvCacRatio: number;
  projectedMonthlyRevenue: number;
  growthRate: number; // Month over month %
}

export async function getOverallMetrics(
  startDate: Date,
  endDate: Date
): Promise<OverallMetrics> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Get all revenue streams in parallel
  const [affiliate, subscription, advertising] = await Promise.all([
    getAffiliateMetrics(startDate, endDate),
    getSubscriptionMetrics(startDate, endDate),
    getAdvertisingMetrics(startDate, endDate),
  ]);

  const affiliateRevenue = affiliate.totalRevenue;
  const subscriptionRevenue = subscription.mrr;
  const advertisingRevenue = advertising.totalRevenue;
  const totalRevenue = affiliateRevenue + subscriptionRevenue + advertisingRevenue;

  // Get user metrics
  const userData = (await connection`
    SELECT
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE created_at >= ${subDays(new Date(), 30)}) as active_users
    FROM "user"
  `)[0];

  const totalUsers = Number(userData?.total_users || 1);
  const activeUsers = Number(userData?.active_users || 0);
  const revenuePerUser = totalUsers > 0 ? totalRevenue / totalUsers : 0;

  // Get CAC (Customer Acquisition Cost) - estimated from ad spend
  // TODO: Integrate with actual ad spend data
  const estimatedCac = 5.0; // Placeholder

  // Get LTV
  const ltv = subscription.averageLTV;
  const ltvCacRatio = estimatedCac > 0 ? ltv / estimatedCac : 0;

  // Calculate growth rate
  const daysInPeriod = differenceInDays(end, start);
  const previousStart = subDays(start, daysInPeriod);
  const previousEnd = subDays(end, daysInPeriod);

  const [previousAffiliate, previousSubscription, previousAdvertising] = await Promise.all([
    getAffiliateMetrics(previousStart, previousEnd),
    getSubscriptionMetrics(previousStart, previousEnd),
    getAdvertisingMetrics(previousStart, previousEnd),
  ]);

  const previousRevenue =
    previousAffiliate.totalRevenue +
    previousSubscription.mrr +
    previousAdvertising.totalRevenue;

  const growthRate =
    previousRevenue > 0
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  // Project monthly revenue
  const dailyAverage = totalRevenue / Math.max(daysInPeriod, 1);
  const projectedMonthlyRevenue = dailyAverage * 30;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    affiliateRevenue: Number(affiliateRevenue.toFixed(2)),
    subscriptionRevenue: Number(subscriptionRevenue.toFixed(2)),
    advertisingRevenue: Number(advertisingRevenue.toFixed(2)),
    revenuePerUser: Number(revenuePerUser.toFixed(2)),
    totalUsers,
    activeUsers,
    cac: estimatedCac,
    ltv: Number(ltv.toFixed(2)),
    ltvCacRatio: Number(ltvCacRatio.toFixed(2)),
    projectedMonthlyRevenue: Number(projectedMonthlyRevenue.toFixed(2)),
    growthRate: Number(growthRate.toFixed(2)),
  };
}

export async function getRevenueTrend(startDate: Date, endDate: Date) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const result = await connection`
    SELECT
      date,
      COALESCE(SUM(affiliate_revenue), 0) as affiliate,
      COALESCE(SUM(mrr), 0) as subscription,
      COALESCE(SUM(ad_revenue), 0) as advertising,
      COALESCE(SUM(total_revenue), 0) as total
    FROM daily_revenue_rollup
    WHERE date >= ${start} AND date <= ${end}
    GROUP BY date
    ORDER BY date ASC
  `;

  return (result as any[]).map((r) => ({
    date: format(new Date(r.date), "MMM dd"),
    affiliate: Number(r.affiliate),
    subscription: Number(r.subscription),
    advertising: Number(r.advertising),
    total: Number(r.total),
  }));
}
