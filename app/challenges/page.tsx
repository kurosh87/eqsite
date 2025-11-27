"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Flame,
  Target,
  Clock,
  Users,
  Star,
  Medal,
  Crown,
  Zap,
  CheckCircle,
  Calendar,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  category: string;
  xpReward: number;
  requirement: {
    type: string;
    target: number;
    current?: number;
  };
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  participants?: number;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streak: number;
  badges: number;
  isCurrentUser?: boolean;
}

const CHALLENGE_CATEGORIES = [
  { id: "practice", label: "Practice", icon: Target, color: "text-blue-500" },
  { id: "reflection", label: "Reflection", icon: Sparkles, color: "text-purple-500" },
  { id: "learning", label: "Learning", icon: Star, color: "text-amber-500" },
  { id: "social", label: "Social", icon: Users, color: "text-pink-500" },
];

// Mock data - in production, this would come from API
const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "1",
    title: "Mindful Week",
    description: "Complete 7 daily mood check-ins this week",
    type: "weekly",
    category: "practice",
    xpReward: 100,
    requirement: { type: "check_ins", target: 7, current: 3 },
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false,
    participants: 234,
  },
  {
    id: "2",
    title: "Daily Reflection",
    description: "Write a journal entry today",
    type: "daily",
    category: "reflection",
    xpReward: 25,
    requirement: { type: "journal_entry", target: 1, current: 0 },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false,
    participants: 456,
  },
  {
    id: "3",
    title: "EQ Explorer",
    description: "Complete 3 EQ games",
    type: "daily",
    category: "learning",
    xpReward: 30,
    requirement: { type: "games", target: 3, current: 1 },
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false,
    participants: 189,
  },
  {
    id: "4",
    title: "Assessment Master",
    description: "Complete a full EQ assessment",
    type: "weekly",
    category: "practice",
    xpReward: 150,
    requirement: { type: "assessment", target: 1, current: 0 },
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    isCompleted: false,
    participants: 89,
  },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "1", name: "Alex Chen", xp: 2450, streak: 15, badges: 12 },
  { rank: 2, userId: "2", name: "Sarah Kim", xp: 2280, streak: 12, badges: 10 },
  { rank: 3, userId: "3", name: "Mike Johnson", xp: 2150, streak: 8, badges: 9 },
  { rank: 4, userId: "4", name: "Emma Wilson", xp: 1920, streak: 10, badges: 8 },
  { rank: 5, userId: "5", name: "You", xp: 1850, streak: 7, badges: 6, isCurrentUser: true },
  { rank: 6, userId: "6", name: "David Lee", xp: 1780, streak: 5, badges: 7 },
  { rank: 7, userId: "7", name: "Lisa Brown", xp: 1650, streak: 4, badges: 5 },
  { rank: 8, userId: "8", name: "James Taylor", xp: 1520, streak: 6, badges: 4 },
];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const dailyChallenges = challenges.filter(c => c.type === "daily");
  const weeklyChallenges = challenges.filter(c => c.type === "weekly");
  const completedChallenges = challenges.filter(c => c.isCompleted);

  function getTimeRemaining(endDate: string) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h left`;
    return `${hours}h left`;
  }

  function getChallengeProgress(challenge: Challenge) {
    const current = challenge.requirement.current || 0;
    const target = challenge.requirement.target;
    return Math.min((current / target) * 100, 100);
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          Challenges
        </h1>
        <p className="text-muted-foreground">
          Complete challenges to earn XP and climb the leaderboard
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">1850</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Medal className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">#5</p>
                <p className="text-xs text-muted-foreground">Rank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Active Challenges */}
        <TabsContent value="active">
          <div className="space-y-6">
            {/* Daily Challenges */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Challenges
              </h2>
              <div className="space-y-3">
                {dailyChallenges.map(challenge => {
                  const category = CHALLENGE_CATEGORIES.find(c => c.id === challenge.category);
                  const Icon = category?.icon || Target;
                  const progress = getChallengeProgress(challenge);

                  return (
                    <Card key={challenge.id} className={cn(
                      challenge.isCompleted && "border-green-500/50 bg-green-500/5"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center",
                            challenge.isCompleted ? "bg-green-500/10" : "bg-muted"
                          )}>
                            {challenge.isCompleted ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <Icon className={cn("h-6 w-6", category?.color)} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold">{challenge.title}</h3>
                              <Badge variant="outline" className="text-amber-600">
                                +{challenge.xpReward} XP
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Progress value={progress} className="h-2" />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {challenge.requirement.current || 0}/{challenge.requirement.target}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeRemaining(challenge.endDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Weekly Challenges */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Weekly Challenges
              </h2>
              <div className="space-y-3">
                {weeklyChallenges.map(challenge => {
                  const category = CHALLENGE_CATEGORIES.find(c => c.id === challenge.category);
                  const Icon = category?.icon || Target;
                  const progress = getChallengeProgress(challenge);

                  return (
                    <Card key={challenge.id} className={cn(
                      "border-amber-500/30",
                      challenge.isCompleted && "border-green-500/50 bg-green-500/5"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center",
                            challenge.isCompleted ? "bg-green-500/10" : "bg-amber-500/10"
                          )}>
                            {challenge.isCompleted ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <Icon className={cn("h-6 w-6", category?.color)} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold">{challenge.title}</h3>
                              <Badge className="bg-amber-500">
                                +{challenge.xpReward} XP
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Progress value={progress} className="h-2" />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {challenge.requirement.current || 0}/{challenge.requirement.target}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {getTimeRemaining(challenge.endDate)}
                              </span>
                            </div>
                            {challenge.participants && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                {challenge.participants} participants
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Weekly Leaderboard
              </CardTitle>
              <CardDescription>Top performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg transition-colors",
                      entry.isCurrentUser
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm",
                      entry.rank === 1 && "bg-amber-500 text-white",
                      entry.rank === 2 && "bg-gray-400 text-white",
                      entry.rank === 3 && "bg-amber-700 text-white",
                      entry.rank > 3 && "bg-muted"
                    )}>
                      {entry.rank <= 3 ? (
                        <Medal className="h-4 w-4" />
                      ) : (
                        entry.rank
                      )}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {entry.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{entry.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3 text-orange-500" />
                          {entry.streak} day streak
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-amber-500" />
                          {entry.badges} badges
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{entry.xp.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Completed Challenges</CardTitle>
              <CardDescription>Your challenge history</CardDescription>
            </CardHeader>
            <CardContent>
              {completedChallenges.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No completed challenges yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Complete challenges to see them here
                  </p>
                  <Button onClick={() => setActiveTab("active")}>
                    View Active Challenges
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {completedChallenges.map(challenge => (
                    <div
                      key={challenge.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <p className="font-medium">{challenge.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        +{challenge.xpReward} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
