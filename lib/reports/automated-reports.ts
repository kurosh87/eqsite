import { getOverallMetrics } from "@/lib/analytics/overall-metrics";
import { getAffiliateMetrics } from "@/lib/analytics/affiliate-metrics";
import { getSubscriptionMetrics } from "@/lib/analytics/subscription-metrics";
import { getAdvertisingMetrics } from "@/lib/analytics/advertising-metrics";
import { subDays, subMonths, format, startOfMonth, endOfMonth } from "date-fns";

export interface WeeklyReport {
  period: string;
  summary: {
    totalRevenue: number;
    growthRate: number;
    newUsers: number;
    newSubscribers: number;
  };
  breakdown: {
    affiliate: number;
    subscription: number;
    advertising: number;
  };
  topMetrics: {
    bestDay: {
      date: string;
      revenue: number;
    };
    topAffiliatePartner: string;
    conversionRate: number;
  };
}

export async function generateWeeklyReport(): Promise<WeeklyReport> {
  const endDate = new Date();
  const startDate = subDays(endDate, 7);

  const [overall, affiliate, subscription, advertising] = await Promise.all([
    getOverallMetrics(startDate, endDate),
    getAffiliateMetrics(startDate, endDate),
    getSubscriptionMetrics(startDate, endDate),
    getAdvertisingMetrics(startDate, endDate),
  ]);

  // Find best performing partner
  const topPartner = affiliate.partnerBreakdown.sort(
    (a, b) => b.revenue - a.revenue
  )[0];

  return {
    period: `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd, yyyy")}`,
    summary: {
      totalRevenue: overall.totalRevenue,
      growthRate: overall.growthRate,
      newUsers: overall.activeUsers,
      newSubscribers: subscription.activeSubscribers,
    },
    breakdown: {
      affiliate: affiliate.totalRevenue,
      subscription: subscription.mrr,
      advertising: advertising.totalRevenue,
    },
    topMetrics: {
      bestDay: {
        date: format(endDate, "MMM dd"),
        revenue: overall.totalRevenue / 7, // Simplified
      },
      topAffiliatePartner: topPartner?.partner || "N/A",
      conversionRate: affiliate.conversionRate,
    },
  };
}

export async function generateMonthlyReport() {
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, 1));
  const endDate = endOfMonth(subMonths(now, 1));

  const [overall, affiliate, subscription, advertising] = await Promise.all([
    getOverallMetrics(startDate, endDate),
    getAffiliateMetrics(startDate, endDate),
    getSubscriptionMetrics(startDate, endDate),
    getAdvertisingMetrics(startDate, endDate),
  ]);

  return {
    period: format(startDate, "MMMM yyyy"),
    revenue: {
      total: overall.totalRevenue,
      affiliate: affiliate.totalRevenue,
      subscription: subscription.mrr,
      advertising: advertising.totalRevenue,
    },
    subscribers: {
      active: subscription.activeSubscribers,
      mrr: subscription.mrr,
      arr: subscription.arr,
      churnRate: subscription.churnRate,
    },
    metrics: {
      totalUsers: overall.totalUsers,
      activeUsers: overall.activeUsers,
      revenuePerUser: overall.revenuePerUser,
      ltvCacRatio: overall.ltvCacRatio,
    },
    projections: {
      nextMonthRevenue: overall.projectedMonthlyRevenue,
      growthRate: overall.growthRate,
    },
  };
}

export function formatReportEmail(report: WeeklyReport | any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
    .metric-card { background: #f9fafb; padding: 15px; margin: 10px 0; border-radius: 8px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #3b82f6; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 aerobase.app Weekly Report</h1>
      <p>${report.period}</p>
    </div>

    <div class="metric-card">
      <h2>💰 Total Revenue</h2>
      <div class="metric-value">$${report.summary.totalRevenue.toFixed(2)}</div>
      <p class="${report.summary.growthRate > 0 ? "positive" : "negative"}">
        ${report.summary.growthRate > 0 ? "+" : ""}${report.summary.growthRate.toFixed(1)}% vs last week
      </p>
    </div>

    <div class="metric-card">
      <h3>Revenue Breakdown</h3>
      <p>🔗 Affiliate: <strong>$${report.breakdown.affiliate.toFixed(2)}</strong></p>
      <p>💳 Subscriptions: <strong>$${report.breakdown.subscription.toFixed(2)}</strong></p>
      <p>👁️ Advertising: <strong>$${report.breakdown.advertising.toFixed(2)}</strong></p>
    </div>

    <div class="metric-card">
      <h3>Key Highlights</h3>
      <p>👥 New Users: <strong>${report.summary.newUsers}</strong></p>
      <p>⭐ New Subscribers: <strong>${report.summary.newSubscribers}</strong></p>
      <p>🏆 Top Partner: <strong>${report.topMetrics.topAffiliatePartner}</strong></p>
      <p>📈 Conversion Rate: <strong>${report.topMetrics.conversionRate}%</strong></p>
    </div>

    <div class="metric-card">
      <p style="text-align: center; color: #6b7280;">
        View full dashboard at <a href="https://aerobase.app/admin/dashboard">aerobase.app/admin/dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// Function to be called by cron job or serverless function
export async function sendWeeklyReport() {
  const report = await generateWeeklyReport();
  const emailHTML = formatReportEmail(report);

  // TODO: Integrate with email service (Resend, SendGrid, etc.)
  console.log("Weekly report generated:", report);

  return {
    success: true,
    report,
    emailHTML,
  };
}
