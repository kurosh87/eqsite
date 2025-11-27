"use client";

import { useLanguage } from "@/components/language-provider";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import {
  Brain,
  Heart,
  Shield,
  Flame,
  Users,
  Trophy,
  Target,
  Zap,
  Calendar,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Gamepad2,
} from "lucide-react";

interface DashboardContentProps {
  user: {
    displayName?: string | null;
    primaryEmail?: string | null;
    isAdmin?: boolean;
  };
  stats: {
    profile: {
      xp: number;
      level: number;
      xpToNextLevel: number;
      currentStreak: number;
      longestStreak: number;
      totalAssessments: number;
      totalGamesPlayed: number;
    };
    assessments: {
      total: number;
      averageScore: number;
    };
    badges: number;
  };
  assessments: Array<{
    assessment: {
      id: string;
      status: string;
      overallScore: number | null;
      completedAt: Date | null;
    };
    assessmentType: {
      name: string;
      slug: string;
    };
  }>;
  userBadges: Array<{
    userBadge: {
      earnedAt: Date;
    };
    badge: {
      id: string;
      name: string;
      description: string | null;
      icon: string;
      category?: string;
    };
  }>;
  domains: Array<{
    id: string;
    slug: string;
    name: string;
    icon: string | null;
    color: string | null;
  }>;
  latestDomainScores: Record<string, number> | null;
  todaysChallenge: {
    id: string;
    title: string;
    description: string | null;
    xpReward: number;
  } | null;
  challengeCompleted: boolean;
}

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  "self-awareness": <Brain className="w-5 h-5" />,
  "self-regulation": <Shield className="w-5 h-5" />,
  motivation: <Flame className="w-5 h-5" />,
  empathy: <Heart className="w-5 h-5" />,
  "social-skills": <Users className="w-5 h-5" />,
};

function getScoreLevel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 60) return { label: "Good", color: "text-blue-600" };
  if (score >= 40) return { label: "Average", color: "text-yellow-600" };
  return { label: "Developing", color: "text-orange-600" };
}

export function DashboardContent({
  user,
  stats,
  assessments,
  userBadges,
  domains,
  latestDomainScores,
  todaysChallenge,
  challengeCompleted,
}: DashboardContentProps) {
  const { t } = useLanguage();
  const xpProgress = (stats.profile.xp / stats.profile.xpToNextLevel) * 100;

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
                <Brain className="h-7 w-7 text-primary" />
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

          {/* Level & XP Progress */}
          <Card className="mb-8 animate-slide-up border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-primary-foreground">
                        {stats.profile.level}
                      </span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Level</div>
                    <div className="text-2xl font-bold">EQ Explorer</div>
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress to Level {stats.profile.level + 1}</span>
                    <span className="font-medium">{stats.profile.xp} / {stats.profile.xpToNextLevel} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-3" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats.profile.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="animate-slide-up stagger-1 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-500/30 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t.dashboard.stats.totalAssessments}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.assessments.total}</div>
                <p className="text-sm text-muted-foreground">Assessments completed</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up stagger-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-green-500/30 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Score
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.assessments.averageScore}%</div>
                <p className="text-sm text-muted-foreground">
                  <span className={getScoreLevel(stats.assessments.averageScore).color}>
                    {getScoreLevel(stats.assessments.averageScore).label}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up stagger-3 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-500/30 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Games Played
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Gamepad2 className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.profile.totalGamesPlayed}</div>
                <p className="text-sm text-muted-foreground">EQ training games</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up stagger-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-yellow-500/30 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Badges Earned
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.badges}</div>
                <p className="text-sm text-muted-foreground">Achievements unlocked</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Domain Scores */}
            <Card className="lg:col-span-2 animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Your EQ Profile
                </CardTitle>
                <CardDescription>
                  {latestDomainScores
                    ? "Your latest assessment results across all EQ domains"
                    : "Take an assessment to see your EQ profile"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestDomainScores ? (
                  <div className="space-y-4">
                    {domains.map((domain) => {
                      const score = latestDomainScores[domain.slug] || 0;
                      const level = getScoreLevel(score);
                      return (
                        <div key={domain.id}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${domain.color || '#6366f1'}20` }}
                              >
                                <span style={{ color: domain.color || '#6366f1' }}>
                                  {DOMAIN_ICONS[domain.slug]}
                                </span>
                              </div>
                              <span className="font-medium">{domain.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${level.color}`}>{level.label}</span>
                              <span className="font-bold">{score}%</span>
                            </div>
                          </div>
                          <Progress
                            value={score}
                            className="h-2"
                            style={{ "--progress-background": domain.color || '#6366f1' } as React.CSSProperties}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">No assessments yet</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Take your first EQ assessment to see your strengths
                    </p>
                    <Link href="/assessment">
                      <Button>
                        Start Assessment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Challenge */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Daily Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysChallenge ? (
                  <div>
                    <div className="p-4 bg-muted/50 rounded-lg mb-4">
                      <h3 className="font-semibold mb-2">{todaysChallenge.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {todaysChallenge.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">+{todaysChallenge.xpReward} XP</span>
                      </div>
                      {challengeCompleted && (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    {!challengeCompleted && (
                      <Link href="/check-in">
                        <Button className="w-full">
                          Complete Challenge
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      No challenge available today
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Badges & Actions */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Badges */}
            <Card className="animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Recent Badges
                  </CardTitle>
                  <Link href="/badges">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {userBadges.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {userBadges.slice(0, 6).map(({ badge }) => (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center text-center p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className="h-12 w-12 rounded-full flex items-center justify-center mb-2 bg-yellow-500/20"
                        >
                          <span className="text-2xl">{badge.icon}</span>
                        </div>
                        <span className="text-xs font-medium truncate w-full">
                          {badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">
                      Complete assessments and challenges to earn badges
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/assessment" className="block">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 group">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Take Assessment</div>
                      <div className="text-sm text-muted-foreground">
                        Measure your emotional intelligence
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>

                <Link href="/games" className="block">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 group">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4 group-hover:bg-purple-500/20 transition-colors">
                      <Gamepad2 className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Play EQ Games</div>
                      <div className="text-sm text-muted-foreground">
                        Train your emotional skills
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>

                <Link href="/check-in" className="block">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 group">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mr-4 group-hover:bg-green-500/20 transition-colors">
                      <Heart className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Emotion Check-In</div>
                      <div className="text-sm text-muted-foreground">
                        Track how you&apos;re feeling
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Assessments */}
          {assessments.length > 0 && (
            <Card className="mt-8 animate-slide-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Assessments
                  </CardTitle>
                  <Link href="/history">
                    <Button variant="ghost" size="sm">
                      View All
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessments.slice(0, 3).map(({ assessment, assessmentType }) => (
                    <Link
                      key={assessment.id}
                      href={`/results/${assessment.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Target className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{assessmentType.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {assessment.completedAt
                                ? new Date(assessment.completedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "In Progress"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {assessment.overallScore !== null && (
                            <div className="text-right">
                              <div className="text-2xl font-bold">{assessment.overallScore}%</div>
                              <div className={`text-sm ${getScoreLevel(assessment.overallScore).color}`}>
                                {getScoreLevel(assessment.overallScore).label}
                              </div>
                            </div>
                          )}
                          <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <div className="mt-12 text-center animate-fade-in">
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
                <Link href="/learn">
                  <Button>
                    Explore
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
