"use client";

import { useState, useEffect, useCallback } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DateRangeSelector } from "@/components/dashboard/DateRangeSelector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  TrendingUp,
  MousePointerClick,
  CreditCard,
  Eye,
  Download,
} from "lucide-react";
import { subDays } from "date-fns";

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  });

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/analytics?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      );
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange.end, dateRange.start]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleExport = async () => {
    const response = await fetch(
      `/api/admin/analytics/export?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
    );
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenue-report-${Date.now()}.csv`;
    a.click();
  };

  if (loading || !metrics) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overall, affiliate, subscription, advertising, trends } = metrics;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Revenue Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for aerobase.app
          </p>
        </div>
        <div className="flex gap-3">
          <DateRangeSelector
            onRangeChange={(start, end) => setDateRange({ start, end })}
          />
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overall KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={overall.totalRevenue}
          prefix="$"
          change={overall.growthRate}
          icon={DollarSign}
        />
        <KPICard
          title="Monthly Recurring Revenue"
          value={subscription.mrr}
          prefix="$"
          icon={CreditCard}
          description="From subscriptions"
        />
        <KPICard
          title="Active Users"
          value={overall.activeUsers}
          icon={Users}
        />
        <KPICard
          title="LTV:CAC Ratio"
          value={overall.ltvCacRatio}
          suffix=":1"
          icon={TrendingUp}
          description="Lifetime value to acquisition cost"
        />
      </div>

      {/* Revenue Trend Chart */}
      <RevenueChart
        title="Revenue Trends"
        data={trends.revenue}
        type="area"
      />

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Affiliate Revenue"
          value={overall.affiliateRevenue}
          prefix="$"
          icon={MousePointerClick}
        />
        <KPICard
          title="Subscription Revenue"
          value={overall.subscriptionRevenue}
          prefix="$"
          icon={CreditCard}
        />
        <KPICard
          title="Advertising Revenue"
          value={overall.advertisingRevenue}
          prefix="$"
          icon={Eye}
        />
      </div>

      {/* Affiliate Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Affiliate Performance</h2>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <KPICard
            title="Total Clicks"
            value={affiliate.totalClicks}
          />
          <KPICard
            title="Conversions"
            value={affiliate.totalConversions}
          />
          <KPICard
            title="CTR"
            value={affiliate.ctr}
            suffix="%"
          />
          <KPICard
            title="Revenue/Click"
            value={affiliate.revenuePerClick}
            prefix="$"
          />
        </div>

        {/* Partner Breakdown Table */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Partner Breakdown</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Partner</th>
                  <th className="text-right p-3 text-sm font-medium">Clicks</th>
                  <th className="text-right p-3 text-sm font-medium">Conversions</th>
                  <th className="text-right p-3 text-sm font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {affiliate.partnerBreakdown.map((partner: any) => (
                  <tr key={partner.partner} className="border-t">
                    <td className="p-3 capitalize">{partner.partner}</td>
                    <td className="p-3 text-right">{partner.clicks.toLocaleString()}</td>
                    <td className="p-3 text-right">{partner.conversions}</td>
                    <td className="p-3 text-right font-medium">
                      ${partner.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Subscription Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Subscription Analytics</h2>
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <KPICard
            title="MRR"
            value={subscription.mrr}
            prefix="$"
          />
          <KPICard
            title="ARR"
            value={subscription.arr}
            prefix="$"
          />
          <KPICard
            title="Active Subscribers"
            value={subscription.activeSubscribers}
          />
          <KPICard
            title="Churn Rate"
            value={subscription.churnRate}
            suffix="%"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-4">
          <KPICard
            title="Avg LTV"
            value={subscription.averageLTV}
            prefix="$"
          />
          <KPICard
            title="Freemium Conversion"
            value={subscription.freemiumConversionRate}
            suffix="%"
          />
          <KPICard
            title="Trial → Paid"
            value={subscription.trialToPaidRate}
            suffix="%"
          />
        </div>

        {/* Tier Breakdown */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Revenue by Tier</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 bg-blue-50">
              <p className="text-sm text-muted-foreground">Explorer ($9.99/mo)</p>
              <p className="text-2xl font-bold">${subscription.revenueByTier.explorer}</p>
            </Card>
            <Card className="p-4 bg-purple-50">
              <p className="text-sm text-muted-foreground">Traveler ($19.99/mo)</p>
              <p className="text-2xl font-bold">${subscription.revenueByTier.traveler}</p>
            </Card>
            <Card className="p-4 bg-amber-50">
              <p className="text-sm text-muted-foreground">Globetrotter ($39.99/mo)</p>
              <p className="text-2xl font-bold">${subscription.revenueByTier.globetrotter}</p>
            </Card>
          </div>
        </div>
      </Card>

      {/* Advertising Metrics */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Advertising Performance</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <KPICard
            title="Impressions"
            value={advertising.totalImpressions}
          />
          <KPICard
            title="Clicks"
            value={advertising.totalClicks}
          />
          <KPICard
            title="RPM"
            value={advertising.rpm}
            prefix="$"
          />
          <KPICard
            title="CTR"
            value={advertising.ctr}
            suffix="%"
          />
        </div>

        {/* Placement Breakdown */}
        <div className="mt-6">
          <h3 className="font-semibold mb-3">Performance by Placement</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Placement</th>
                  <th className="text-right p-3 text-sm font-medium">Impressions</th>
                  <th className="text-right p-3 text-sm font-medium">Clicks</th>
                  <th className="text-right p-3 text-sm font-medium">RPM</th>
                  <th className="text-right p-3 text-sm font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {advertising.placementBreakdown.map((placement: any) => (
                  <tr key={placement.placement} className="border-t">
                    <td className="p-3 capitalize">{placement.placement.replace('_', ' ')}</td>
                    <td className="p-3 text-right">{placement.impressions.toLocaleString()}</td>
                    <td className="p-3 text-right">{placement.clicks}</td>
                    <td className="p-3 text-right">${placement.rpm}</td>
                    <td className="p-3 text-right font-medium">
                      ${placement.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Financial Projections */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Projections & Insights</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <KPICard
            title="Projected Monthly Revenue"
            value={overall.projectedMonthlyRevenue}
            prefix="$"
            description="Based on current growth rate"
          />
          <KPICard
            title="Revenue per User"
            value={overall.revenuePerUser}
            prefix="$"
          />
          <KPICard
            title="Growth Rate"
            value={overall.growthRate}
            suffix="%"
            change={overall.growthRate}
            changeLabel="vs previous period"
          />
        </div>
      </Card>
    </div>
  );
}
