"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Gamepad2,
  Brain,
  Heart,
  Smile,
  Users,
  Zap,
  Trophy,
  Clock,
  Star,
  ArrowRight,
  Lock,
} from "lucide-react";

interface Game {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  difficulty: string;
  estimatedTime: number;
  xpReward: number;
  isPremium: boolean;
}

const GAME_ICONS: Record<string, React.ReactNode> = {
  "emotion-recognition": <Smile className="w-8 h-8" />,
  "empathy-scenarios": <Heart className="w-8 h-8" />,
  "social-navigation": <Users className="w-8 h-8" />,
  "mindfulness-minute": <Brain className="w-8 h-8" />,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600",
  intermediate: "bg-yellow-500/10 text-yellow-600",
  advanced: "bg-orange-500/10 text-orange-600",
  expert: "bg-red-500/10 text-red-600",
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    try {
      const res = await fetch("/api/games");
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch (error) {
      console.error("Failed to fetch games:", error);
    } finally {
      setLoading(false);
    }
  }

  const categories = Array.from(new Set(games.map((g) => g.category)));
  const filteredGames = selectedCategory
    ? games.filter((g) => g.category === selectedCategory)
    : games;

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
        <div className="absolute top-20 start-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 end-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="container relative mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center shadow-lg">
                <Gamepad2 className="h-7 w-7 text-purple-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  EQ Games
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Train your emotional intelligence through play
                </p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4 max-w-2xl">
              Fun, engaging mini-games designed to improve your emotional recognition,
              empathy, and social skills. Earn XP and unlock achievements as you play.
            </p>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All Games
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category.replace("-", " ")}
                </Button>
              ))}
            </div>
          )}

          {/* Games Grid */}
          {filteredGames.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card
                  key={game.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-500/50 relative overflow-hidden"
                >
                  {game.isPremium && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                        {GAME_ICONS[game.slug] || <Gamepad2 className="w-8 h-8" />}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{game.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={DIFFICULTY_COLORS[game.difficulty] || DIFFICULTY_COLORS.beginner}
                          >
                            {game.difficulty}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {game.category.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {game.description}
                    </CardDescription>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {game.estimatedTime} min
                      </div>
                      <div className="flex items-center gap-1 text-yellow-600">
                        <Zap className="w-4 h-4" />
                        +{game.xpReward} XP
                      </div>
                    </div>
                    <Link href={`/games/${game.slug}`}>
                      <Button className="w-full group-hover:bg-purple-600" disabled={game.isPremium}>
                        {game.isPremium ? "Unlock with Pro" : "Play Now"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Coming Soon!</h3>
                <p className="text-muted-foreground mb-4">
                  We&apos;re building exciting EQ games to help you improve your emotional intelligence.
                  Check back soon!
                </p>
                <Link href="/dashboard">
                  <Button variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Featured Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Why Play EQ Games?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-transparent hover:border-purple-500/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-bold mb-2">Train Your Brain</h3>
                  <p className="text-muted-foreground text-sm">
                    Research shows gamified learning improves emotional recognition by up to 40%.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent hover:border-purple-500/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                  <h3 className="font-bold mb-2">Earn Rewards</h3>
                  <p className="text-muted-foreground text-sm">
                    Gain XP, unlock badges, and climb the leaderboard as you master each game.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-transparent hover:border-purple-500/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                    <Star className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-bold mb-2">Track Progress</h3>
                  <p className="text-muted-foreground text-sm">
                    See your improvement over time with detailed analytics and personal bests.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
