import { format } from "date-fns";

export function generateRevenueCSV(data: {
  overall: any;
  affiliate: any;
  subscription: any;
  advertising: any;
  trends: any;
}): string {
  const { overall, affiliate, subscription, advertising, trends } = data;

  // CSV Header
  let csv = "aerobase.app Revenue Report\n";
  csv += `Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}\n\n`;

  // Overall Metrics Section
  csv += "=== OVERALL METRICS ===\n";
  csv += "Metric,Value\n";
  csv += `Total Revenue,$${overall.totalRevenue}\n`;
  csv += `Affiliate Revenue,$${overall.affiliateRevenue}\n`;
  csv += `Subscription Revenue,$${overall.subscriptionRevenue}\n`;
  csv += `Advertising Revenue,$${overall.advertisingRevenue}\n`;
  csv += `Total Users,${overall.totalUsers}\n`;
  csv += `Active Users,${overall.activeUsers}\n`;
  csv += `Revenue per User,$${overall.revenuePerUser}\n`;
  csv += `Growth Rate,${overall.growthRate}%\n`;
  csv += `LTV:CAC Ratio,${overall.ltvCacRatio}:1\n`;
  csv += `Projected Monthly Revenue,$${overall.projectedMonthlyRevenue}\n\n`;

  // Affiliate Metrics
  csv += "=== AFFILIATE METRICS ===\n";
  csv += "Metric,Value\n";
  csv += `Total Clicks,${affiliate.totalClicks}\n`;
  csv += `Conversions,${affiliate.totalConversions}\n`;
  csv += `Revenue,$${affiliate.totalRevenue}\n`;
  csv += `CTR,${affiliate.ctr}%\n`;
  csv += `Conversion Rate,${affiliate.conversionRate}%\n`;
  csv += `Revenue per Click,$${affiliate.revenuePerClick}\n\n`;

  csv += "Partner Breakdown\n";
  csv += "Partner,Clicks,Conversions,Revenue\n";
  affiliate.partnerBreakdown.forEach((p: any) => {
    csv += `${p.partner},${p.clicks},${p.conversions},$${p.revenue}\n`;
  });
  csv += "\n";

  // Subscription Metrics
  csv += "=== SUBSCRIPTION METRICS ===\n";
  csv += "Metric,Value\n";
  csv += `MRR,$${subscription.mrr}\n`;
  csv += `ARR,$${subscription.arr}\n`;
  csv += `Active Subscribers,${subscription.activeSubscribers}\n`;
  csv += `Churn Rate,${subscription.churnRate}%\n`;
  csv += `Average LTV,$${subscription.averageLTV}\n`;
  csv += `Freemium Conversion,${subscription.freemiumConversionRate}%\n`;
  csv += `Trial to Paid,${subscription.trialToPaidRate}%\n\n`;

  csv += "Revenue by Tier\n";
  csv += "Tier,Revenue\n";
  csv += `Explorer,$${subscription.revenueByTier.explorer}\n`;
  csv += `Traveler,$${subscription.revenueByTier.traveler}\n`;
  csv += `Globetrotter,$${subscription.revenueByTier.globetrotter}\n\n`;

  // Advertising Metrics
  csv += "=== ADVERTISING METRICS ===\n";
  csv += "Metric,Value\n";
  csv += `Total Impressions,${advertising.totalImpressions}\n`;
  csv += `Total Clicks,${advertising.totalClicks}\n`;
  csv += `Revenue,$${advertising.totalRevenue}\n`;
  csv += `RPM,$${advertising.rpm}\n`;
  csv += `CPM,$${advertising.cpm}\n`;
  csv += `CTR,${advertising.ctr}%\n\n`;

  csv += "Placement Performance\n";
  csv += "Placement,Impressions,Clicks,Revenue,RPM\n";
  advertising.placementBreakdown.forEach((p: any) => {
    csv += `${p.placement},${p.impressions},${p.clicks},$${p.revenue},$${p.rpm}\n`;
  });
  csv += "\n";

  // Daily Trend
  csv += "=== DAILY REVENUE TREND ===\n";
  csv += "Date,Affiliate,Subscription,Advertising,Total\n";
  trends.revenue.forEach((day: any) => {
    csv += `${day.date},$${day.affiliate},$${day.subscription},$${day.advertising},$${day.total}\n`;
  });

  return csv;
}
