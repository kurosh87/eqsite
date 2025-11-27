"use client";

/* eslint-disable @next/next/no-img-element -- dashboard cards render user images from arbitrary origins */

import { useLanguage } from "@/components/language-provider";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Upload, History, TrendingUp, Sparkles, ArrowRight, Zap, Clock, Dna } from "lucide-react";

interface DashboardContentProps {
  user: {
    displayName?: string | null;
    primaryEmail?: string | null;
    isAdmin?: boolean;
  };
  history: Record<string, any>[];
  thisMonthCount: number;
}

function safeJsonParse(value: string): any[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function DashboardContent({ user, history, thisMonthCount }: DashboardContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader user={user} />

      <main id="main-content" className="flex-1 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="absolute top-20 start-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 end-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container relative mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-lg">
                <Dna className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {t.dashboard.welcome}
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  {user.displayName || user.primaryEmail?.split("@")[0]}
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              {t.dashboard.subtitle}
            </p>
          </div>

          {/* Stats Cards with staggered animation */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="animate-slide-up stagger-1 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-emerald-500/30 bg-gradient-to-br from-background via-background to-emerald-500/5 group" style={{ animationFillMode: "both" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.dashboard.stats.totalAnalyses}
                </CardTitle>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <History className="h-6 w-6 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">
                  {history.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.stats.totalAnalysesDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up stagger-2 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 hover:border-blue-500/30 bg-gradient-to-br from-background via-background to-blue-500/5 group" style={{ animationFillMode: "both" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.dashboard.stats.thisMonth}
                </CardTitle>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">
                  {thisMonthCount}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.dashboard.stats.thisMonthDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up stagger-3 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-primary/30 hover:border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-background group" style={{ animationFillMode: "both" }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.dashboard.stats.quickActions}
                </CardTitle>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/20 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <Link href="/">
                  <Button className="w-full h-12 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary to-primary/90">
                    <Upload className="w-5 h-5 me-2" />
                    {t.dashboard.stats.newAnalysis}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Analysis History */}
          <Card className="border-2 shadow-lg animate-slide-up stagger-4" style={{ animationFillMode: "both" }}>
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{t.dashboard.history.title}</CardTitle>
                </div>
                {history.length > 0 && (
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {history.length} {t.dashboard.history.total}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex justify-center mb-6">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {t.dashboard.history.empty}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    {t.dashboard.history.emptyDesc}
                  </p>
                  <Link href="/">
                    <Button size="lg" className="h-12 px-8">
                      <Upload className="w-4 h-4 me-2" />
                      {t.dashboard.history.uploadPhoto}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item: Record<string, any>) => {
                    const matches = Array.isArray(item.topMatches)
                      ? item.topMatches
                      : typeof item.topMatches === "string"
                        ? safeJsonParse(item.topMatches)
                        : [];
                    const topMatch = matches?.[0];

                    return (
                      <Link
                        key={item.id}
                        href={`/analysis/${item.id}`}
                        className="block group"
                      >
                        <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                          <CardContent className="p-6">
                            <div className="flex items-center gap-6">
                              {/* Uploaded Image Thumbnail */}
                              <div className="flex-shrink-0">
                                <div className="relative">
                                  <img
                                    src={item.uploadImageUrl}
                                    alt="Analysis"
                                    className="w-24 h-24 rounded-xl object-cover ring-2 ring-border"
                                  />
                                </div>
                              </div>

                              {/* Analysis Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="font-bold text-lg">
                                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </h3>
                                  <Badge variant="outline" className="ms-2">
                                    {matches.length} {t.dashboard.history.matches}
                                  </Badge>
                                </div>

                                {topMatch && (
                                  <div className="flex items-center gap-3 mb-3">
                                    <span className="text-sm text-muted-foreground">
                                      {t.dashboard.history.bestMatch}
                                    </span>
                                    <span className="font-semibold text-base">
                                      {topMatch.phenotypeName}
                                    </span>
                                    <Badge className="bg-primary">
                                      {Math.round(
                                        (topMatch.similarity ??
                                          topMatch.embeddingSimilarity ??
                                          topMatch.measurementSimilarity ??
                                          0) * 100
                                      )}%
                                    </Badge>
                                  </div>
                                )}

                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.aiReport?.substring(0, 200)}...
                                </p>
                              </div>

                              {/* Top Match Thumbnail */}
                              {topMatch && (
                                <div className="flex-shrink-0 hidden sm:flex items-center gap-4">
                                  <img
                                    src={topMatch.imageUrl || topMatch.image_url}
                                    alt={topMatch.phenotypeName || topMatch.name}
                                    className="w-20 h-20 rounded-xl object-cover ring-2 ring-border"
                                  />
                                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA Section */}
          {history.length > 0 && (
            <div className="mt-12 text-center animate-fade-in">
              <Link href="/phenotypes">
                <Card className="p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50 inline-block">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-start">
                      <h3 className="text-xl font-bold mb-1">{t.dashboard.explore.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {t.dashboard.explore.subtitle}
                      </p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-muted-foreground rtl:rotate-180" />
                  </div>
                </Card>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
