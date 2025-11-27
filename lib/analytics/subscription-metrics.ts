import { neon } from "@neondatabase/serverless";
import { startOfDay, endOfDay, startOfMonth, differenceInDays, format } from "date-fns";

const connection = neon(process.env.DATABASE_URL!);

export interface SubscriptionMetrics {
  mrr: number;
  arr: number;
  activeSubscribers: number;
  churnRate: number;
  averageLTV: number;
  freemiumConversionRate: number;
  trialToPaidRate: number;
  tierBreakdown: Array<{
    tier: string;
    count: number;
    revenue: number;
  }>;
  revenueByTier: {
    explorer: number;
    traveler: number;
    globetrotter: number;
  };
}

export async function getSubscriptionMetrics(
  startDate: Date,
  endDate: Date
): Promise<SubscriptionMetrics> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Get current MRR and subscriber count
  const mrrData = (await connection`
    SELECT
      COUNT(DISTINCT user_id) as active_subscribers,
      SUM(
        CASE
          WHEN tier = 'explorer' THEN 9.99
          WHEN tier = 'traveler' THEN 19.99
          WHEN tier = 'globetrotter' THEN 39.99
          ELSE 0
        END
      ) as mrr
    FROM subscription_events
    WHERE event_type IN ('subscribe', 'trial_convert', 'upgrade')
      AND user_id NOT IN (
        SELECT user_id FROM subscription_events
        WHERE event_type IN ('churn', 'downgrade')
          AND event_timestamp > ${start}
      )
  `)[0];

  const mrr = Number(mrrData?.mrr || 0);
  const arr = mrr * 12;
  const activeSubscribers = Number(mrrData?.active_subscribers || 0);

  // Get churn rate
  const monthStart = startOfMonth(new Date());
  const churnData = (await connection`
    SELECT
      COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'churn') as churned,
      COUNT(DISTINCT user_id) FILTER (WHERE event_type IN ('subscribe', 'trial_convert')) as total_at_start
    FROM subscription_events
    WHERE event_timestamp >= ${monthStart}
  `)[0];

  const churned = Number(churnData?.churned || 0);
  const totalAtStart = Number(churnData?.total_at_start || 0);
  const churnRate = totalAtStart > 0 ? (churned / totalAtStart) * 100 : 0;

  // Get LTV
  const ltvData = (await connection`
    SELECT AVG(total_lifetime_value) as avg_ltv
    FROM user_cohorts
    WHERE first_subscription_date IS NOT NULL
  `)[0];

  const averageLTV = Number(ltvData?.avg_ltv || 0);

  // Get conversion rates
  const conversionData = (await connection`
    SELECT
      COUNT(DISTINCT user_id) FILTER (
        WHERE event_type IN ('subscribe', 'trial_convert')
      ) as converted,
      (SELECT COUNT(*) FROM "user") as total_users,
      COUNT(DISTINCT user_id) FILTER (
        WHERE event_type = 'trial_convert'
      ) as trial_converted,
      COUNT(DISTINCT user_id) FILTER (
        WHERE event_type = 'trial_start'
      ) as trial_started
    FROM subscription_events
  `)[0];

  const converted = Number(conversionData?.converted || 0);
  const totalUsers = Number(conversionData?.total_users || 1);
  const trialConverted = Number(conversionData?.trial_converted || 0);
  const trialStarted = Number(conversionData?.trial_started || 1);

  const freemiumConversionRate = (converted / totalUsers) * 100;
  const trialToPaidRate = (trialConverted / trialStarted) * 100;

  // Get tier breakdown
  const tierBreakdown = await connection`
    SELECT
      tier,
      COUNT(*) as count,
      SUM(
        CASE
          WHEN tier = 'explorer' THEN 9.99
          WHEN tier = 'traveler' THEN 19.99
          WHEN tier = 'globetrotter' THEN 39.99
          ELSE 0
        END
      ) as revenue
    FROM subscription_events
    WHERE event_type IN ('subscribe', 'trial_convert', 'upgrade')
      AND event_timestamp >= ${start} AND event_timestamp <= ${end}
    GROUP BY tier
  `;

  const revenueByTier = {
    explorer: 0,
    traveler: 0,
    globetrotter: 0,
  };

  (tierBreakdown as any[]).forEach((t) => {
    if (t.tier in revenueByTier) {
      revenueByTier[t.tier as keyof typeof revenueByTier] = Number(t.revenue);
    }
  });

  return {
    mrr: Number(mrr.toFixed(2)),
    arr: Number(arr.toFixed(2)),
    activeSubscribers,
    churnRate: Number(churnRate.toFixed(2)),
    averageLTV: Number(averageLTV.toFixed(2)),
    freemiumConversionRate: Number(freemiumConversionRate.toFixed(2)),
    trialToPaidRate: Number(trialToPaidRate.toFixed(2)),
    tierBreakdown: (tierBreakdown as any[]).map((t) => ({
      tier: String(t.tier),
      count: Number(t.count),
      revenue: Number(t.revenue),
    })),
    revenueByTier,
  };
}

export async function getSubscriptionTrend(
  startDate: Date,
  endDate: Date
) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const result = await connection`
    SELECT
      DATE(event_timestamp) as date,
      COUNT(*) FILTER (WHERE event_type IN ('subscribe', 'trial_convert')) as new_subs,
      COUNT(*) FILTER (WHERE event_type = 'churn') as churned,
      SUM(mrr_change) as mrr_change
    FROM subscription_events
    WHERE event_timestamp >= ${start} AND event_timestamp <= ${end}
    GROUP BY DATE(event_timestamp)
    ORDER BY date ASC
  `;

  return (result as any[]).map((r) => ({
    date: format(new Date(r.date), "MMM dd"),
    newSubscribers: Number(r.new_subs),
    churned: Number(r.churned),
    mrrChange: Number(r.mrr_change),
  }));
}
