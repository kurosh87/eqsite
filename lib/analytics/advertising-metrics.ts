import { neon } from "@neondatabase/serverless";
import { startOfDay, endOfDay, format } from "date-fns";

const connection = neon(process.env.DATABASE_URL!);

export interface AdvertisingMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  rpm: number;
  cpm: number;
  ctr: number;
  placementBreakdown: Array<{
    placement: string;
    impressions: number;
    clicks: number;
    revenue: number;
    rpm: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    impressions: number;
    revenue: number;
  }>;
}

export async function getAdvertisingMetrics(
  startDate: Date,
  endDate: Date
): Promise<AdvertisingMetrics> {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Get overall metrics
  const overallMetrics = (await connection`
    SELECT
      SUM(impressions) as total_impressions,
      SUM(clicks) as total_clicks,
      COALESCE(SUM(revenue), 0) as total_revenue
    FROM ad_impressions
    WHERE timestamp >= ${start} AND timestamp <= ${end}
  `)[0];

  const totalImpressions = Number(overallMetrics?.total_impressions || 0);
  const totalClicks = Number(overallMetrics?.total_clicks || 0);
  const totalRevenue = Number(overallMetrics?.total_revenue || 0);

  // Calculate rates
  const rpm = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
  const cpm = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Get placement breakdown
  const placementBreakdown = await connection`
    SELECT
      placement,
      SUM(impressions) as impressions,
      SUM(clicks) as clicks,
      COALESCE(SUM(revenue), 0) as revenue
    FROM ad_impressions
    WHERE timestamp >= ${start} AND timestamp <= ${end}
    GROUP BY placement
    ORDER BY revenue DESC
  `;

  // Get device breakdown
  const deviceBreakdown = await connection`
    SELECT
      COALESCE(device_type, 'unknown') as device,
      SUM(impressions) as impressions,
      COALESCE(SUM(revenue), 0) as revenue
    FROM ad_impressions
    WHERE timestamp >= ${start} AND timestamp <= ${end}
    GROUP BY device_type
    ORDER BY revenue DESC
  `;

  return {
    totalImpressions,
    totalClicks,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    rpm: Number(rpm.toFixed(2)),
    cpm: Number(cpm.toFixed(2)),
    ctr: Number(ctr.toFixed(2)),
    placementBreakdown: (placementBreakdown as any[]).map((p) => {
      const impr = Number(p.impressions);
      const rev = Number(p.revenue);
      return {
        placement: String(p.placement),
        impressions: impr,
        clicks: Number(p.clicks),
        revenue: rev,
        rpm: impr > 0 ? Number(((rev / impr) * 1000).toFixed(2)) : 0,
      };
    }),
    deviceBreakdown: (deviceBreakdown as any[]).map((d) => ({
      device: String(d.device),
      impressions: Number(d.impressions),
      revenue: Number(d.revenue),
    })),
  };
}

export async function getAdvertisingTrend(
  startDate: Date,
  endDate: Date
) {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  const result = await connection`
    SELECT
      DATE(timestamp) as date,
      SUM(impressions) as impressions,
      SUM(clicks) as clicks,
      COALESCE(SUM(revenue), 0) as revenue
    FROM ad_impressions
    WHERE timestamp >= ${start} AND timestamp <= ${end}
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `;

  return (result as any[]).map((r) => ({
    date: format(new Date(r.date), "MMM dd"),
    impressions: Number(r.impressions),
    clicks: Number(r.clicks),
    revenue: Number(r.revenue),
  }));
}
