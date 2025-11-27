"use client";

import { useState, useEffect } from "react";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Calendar,
  Target,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Assessment {
  id: string;
  completedAt: string;
  overallScore: number;
  domainScores: Record<string, number>;
}

interface ProgressData {
  assessments: Assessment[];
  domains: Array<{
    slug: string;
    name: string;
    color: string;
  }>;
  stats: {
    totalAssessments: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    improvement: number;
  };
}

const DOMAIN_COLORS: Record<string, string> = {
  "self-awareness": "#3b82f6",
  "self-regulation": "#10b981",
  "motivation": "#f59e0b",
  "empathy": "#ec4899",
  "social-skills": "#8b5cf6",
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("all");

  useEffect(() => {
    fetchProgress();
  }, [timeRange]);

  async function fetchProgress() {
    try {
      const res = await fetch(`/api/progress?range=${timeRange}`);
      if (res.ok) {
        const progressData = await res.json();
        setData(progressData);
      }
    } catch (error) {
      console.error("Failed to fetch progress:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ModernHeader />
        <main className="flex-1 flex items-center justify-center">
          <Spinner className="h-8 w-8" />
        </main>
      </div>
    );
  }

  // Transform data for charts
  const chartData = data?.assessments.map((a) => ({
    date: new Date(a.completedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: a.overallScore,
    ...a.domainScores,
  })) || [];

  // Radar chart data for latest assessment
  const latestAssessment = data?.assessments[0];
  const radarData = data?.domains.map((domain) => ({
    domain: domain.name,
    score: latestAssessment?.domainScores[domain.slug] || 0,
    fullMark: 100,
  })) || [];

  const getTrendIcon = (improvement: number) => {
    if (improvement > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (improvement < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader />

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="absolute top-20 start-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="container relative mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    Your Progress
                  </h1>
                  <p className="text-muted-foreground text-lg mt-1">
                    Track your emotional intelligence growth over time
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {(["week", "month", "all"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="capitalize"
                  >
                    {range === "all" ? "All Time" : `Past ${range}`}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {data && data.assessments.length > 0 ? (
            <>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Assessments</p>
                        <p className="text-3xl font-bold">{data.stats.totalAssessments}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Average Score</p>
                        <p className="text-3xl font-bold">{data.stats.averageScore}%</p>
                      </div>
                      <Brain className="h-8 w-8 text-purple-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Highest Score</p>
                        <p className="text-3xl font-bold">{data.stats.highestScore}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Improvement</p>
                        <div className="flex items-center gap-2">
                          <p className="text-3xl font-bold">
                            {data.stats.improvement > 0 ? "+" : ""}
                            {data.stats.improvement}%
                          </p>
                          {getTrendIcon(data.stats.improvement)}
                        </div>
                      </div>
                      <Calendar className="h-8 w-8 text-orange-500 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Overall Score Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Overall EQ Score Trend</CardTitle>
                    <CardDescription>Your emotional intelligence score over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" className="text-xs" />
                        <YAxis domain={[0, 100]} className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#colorScore)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Domain Profile</CardTitle>
                    <CardDescription>Your latest scores across all EQ domains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid className="stroke-muted" />
                        <PolarAngleAxis dataKey="domain" className="text-xs" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar
                          name="Score"
                          dataKey="score"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Domain Trends */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Domain Score Trends</CardTitle>
                  <CardDescription>Track individual domain growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      {data.domains.map((domain) => (
                        <Line
                          key={domain.slug}
                          type="monotone"
                          dataKey={domain.slug}
                          name={domain.name}
                          stroke={DOMAIN_COLORS[domain.slug] || "#888"}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    {data.domains.map((domain) => (
                      <div key={domain.slug} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: DOMAIN_COLORS[domain.slug] }}
                        />
                        <span className="text-sm">{domain.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Assessment History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Assessment History</CardTitle>
                      <CardDescription>Your recent assessments</CardDescription>
                    </div>
                    <Link href="/assessment">
                      <Button>
                        Take New Assessment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.assessments.slice(0, 5).map((assessment, idx) => (
                      <Link
                        key={assessment.id}
                        href={`/results/${assessment.id}`}
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary">
                                #{data.assessments.length - idx}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {new Date(assessment.completedAt).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <div className="flex gap-2 mt-1">
                                {Object.entries(assessment.domainScores).slice(0, 3).map(([domain, score]) => (
                                  <Badge key={domain} variant="secondary" className="text-xs">
                                    {domain.split("-").map(w => w[0].toUpperCase()).join("")}: {score}%
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{assessment.overallScore}%</p>
                            <p className="text-sm text-muted-foreground">Overall</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-8 text-center">
                <div className="h-20 w-20 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Progress Data Yet</h2>
                <p className="text-muted-foreground mb-6">
                  Complete your first assessment to start tracking your EQ progress over time.
                </p>
                <Link href="/assessment">
                  <Button size="lg">
                    Take Your First Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
