"use client";

import { useState, useEffect } from "react";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Lock,
  CheckCircle,
  Zap,
  Calendar,
  Star,
} from "lucide-react";

interface BadgeData {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  category: string;
  xpReward: number;
  requirement: {
    type: string;
    value: number;
    domain?: string;
  } | null;
}

interface UserBadge {
  userBadge: {
    earnedAt: string;
  };
  badge: BadgeData;
}

interface Stats {
  profile: {
    level: number;
    currentStreak: number;
    totalAssessments: number;
    totalGamesPlayed: number;
  };
  assessments: {
    total: number;
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  milestone: "Milestones",
  streak: "Streaks",
  mastery: "Mastery",
  social: "Social",
  special: "Special",
};

export default function BadgesPage() {
  const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/user/stats?badges=true");

      if (res.ok) {
        const data = await res.json();
        setStats({
          profile: data.profile,
          assessments: data.stats.assessments,
        });
        setAllBadges(data.badges || []);
        // Transform earned badges to match expected format
        setEarnedBadges((data.earnedBadges || []).map((b: BadgeData & { earnedAt: string }) => ({
          userBadge: { earnedAt: b.earnedAt },
          badge: b,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }

  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge.id));
  const categories = Array.from(new Set(allBadges.map((b) => b.category)));

  function getProgress(badge: BadgeData): number {
    if (!stats || !badge.requirement) return 0;

    let current = 0;
    switch (badge.requirement.type) {
      case "assessments_completed":
        current = stats.profile.totalAssessments;
        break;
      case "streak_days":
        current = stats.profile.currentStreak;
        break;
      case "games_played":
        current = stats.profile.totalGamesPlayed;
        break;
      case "level_reached":
        current = stats.profile.level;
        break;
      default:
        return 0;
    }

    return Math.min(100, (current / badge.requirement.value) * 100);
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="absolute top-20 start-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 end-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container relative mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center shadow-lg">
                <Trophy className="h-7 w-7 text-yellow-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Badges & Achievements
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  {earnedBadges.length} of {allBadges.length} badges earned
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              Collect badges by completing assessments, maintaining streaks, playing games,
              and mastering emotional intelligence skills.
            </p>
          </div>

          {/* Stats Summary */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{earnedBadges.length}</div>
                    <div className="text-sm text-muted-foreground">Badges Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{stats?.profile.totalAssessments || 0}</div>
                    <div className="text-sm text-muted-foreground">Assessments</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{stats?.profile.currentStreak || 0}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Star className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">Level {stats?.profile.level || 1}</div>
                    <div className="text-sm text-muted-foreground">Current Level</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges by Category */}
          {categories.map((category) => {
            const categoryBadges = allBadges.filter((b) => b.category === category);
            return (
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-bold mb-6">{CATEGORY_LABELS[category] || category}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryBadges.map((badge) => {
                    const isEarned = earnedBadgeIds.has(badge.id);
                    const progress = getProgress(badge);
                    const earnedData = earnedBadges.find((b) => b.badge.id === badge.id);

                    return (
                      <Card
                        key={badge.id}
                        className={cn(
                          "transition-all duration-300 hover:-translate-y-1",
                          isEarned
                            ? "border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-transparent"
                            : "opacity-75 hover:opacity-100"
                        )}
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div
                              className={cn(
                                "h-16 w-16 rounded-2xl flex items-center justify-center relative",
                                isEarned ? "" : "grayscale"
                              )}
                              style={{ backgroundColor: `${badge.color}20` }}
                            >
                              <span className="text-3xl">{badge.icon}</span>
                              {isEarned && (
                                <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                              {!isEarned && (
                                <div className="absolute -bottom-1 -right-1 bg-muted rounded-full p-1">
                                  <Lock className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold mb-1">{badge.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {badge.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-medium">+{badge.xpReward} XP</span>
                              </div>
                            </div>
                          </div>

                          {isEarned ? (
                            <div className="mt-4 pt-4 border-t">
                              <Badge className="bg-yellow-500">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Earned {earnedData?.userBadge.earnedAt
                                  ? new Date(earnedData.userBadge.earnedAt).toLocaleDateString()
                                  : ""}
                              </Badge>
                            </div>
                          ) : badge.requirement && (
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {allBadges.length === 0 && (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-8 pb-8 text-center">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Badges Yet</h3>
                <p className="text-muted-foreground">
                  Badges will appear here as you complete assessments and activities.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
