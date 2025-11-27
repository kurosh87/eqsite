"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  Gamepad2,
  Smile,
  Frown,
  Meh,
  Heart,
  Angry,
  Zap,
  CheckCircle,
  XCircle,
  Trophy,
  ArrowRight,
  RotateCcw,
  Clock,
} from "lucide-react";

interface GameContent {
  id: string;
  contentType: string;
  content: {
    emotion?: string;
    imageUrl?: string;
    options?: string[];
    correctAnswer?: string;
    scenario?: string;
    question?: string;
    responses?: Array<{ text: string; score: number }>;
  };
  correctAnswer: string | null;
  difficulty: string;
  xpValue: number;
}

interface Game {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  instructions: string | null;
  xpReward: number;
}

const EMOTION_ICONS: Record<string, React.ReactNode> = {
  happy: <Smile className="w-6 h-6" />,
  sad: <Frown className="w-6 h-6" />,
  neutral: <Meh className="w-6 h-6" />,
  angry: <Angry className="w-6 h-6" />,
  love: <Heart className="w-6 h-6" />,
};

export default function GamePlayPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [game, setGame] = useState<Game | null>(null);
  const [content, setContent] = useState<GameContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Array<{ correct: boolean; answer: string }>>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGame();
  }, [slug]);

  async function fetchGame() {
    try {
      const res = await fetch(`/api/games?slug=${slug}`);
      if (!res.ok) {
        router.push("/games");
        return;
      }
      const data = await res.json();
      setGame(data.game);
      setContent(data.content || []);
    } catch (error) {
      console.error("Failed to fetch game:", error);
      router.push("/games");
    } finally {
      setLoading(false);
    }
  }

  const startGame = useCallback(() => {
    setGameStarted(true);
    setCurrentRound(0);
    setScore(0);
    setAnswers([]);
    setGameComplete(false);
    setStartTime(Date.now());
  }, []);

  function handleAnswer(answer: string) {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const currentContent = content[currentRound];
    const isCorrect = currentContent.correctAnswer?.toLowerCase() === answer.toLowerCase();

    if (isCorrect) {
      setScore((prev) => prev + (currentContent.xpValue || 10));
    }

    setAnswers((prev) => [...prev, { correct: isCorrect, answer }]);

    // Auto advance after feedback
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);

      if (currentRound < content.length - 1) {
        setCurrentRound((prev) => prev + 1);
      } else {
        completeGame();
      }
    }, 1500);
  }

  async function completeGame() {
    setGameComplete(true);
    setSubmitting(true);

    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.round((answers.filter((a) => a.correct).length / content.length) * 100);
    const maxScore = content.reduce((sum, c) => sum + (c.xpValue || 10), 0);

    try {
      await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameSlug: game?.slug,
          score,
          maxScore,
          accuracy,
          timeTaken,
          roundsCompleted: content.length,
        }),
      });
    } catch (error) {
      console.error("Failed to save game session:", error);
    } finally {
      setSubmitting(false);
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

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ModernHeader />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-8 pb-8 text-center">
              <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Game Not Found</h3>
              <p className="text-muted-foreground mb-4">
                This game doesn&apos;t exist or has been removed.
              </p>
              <Button onClick={() => router.push("/games")}>
                Back to Games
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Game Complete Screen
  if (gameComplete) {
    const accuracy = Math.round((answers.filter((a) => a.correct).length / content.length) * 100);
    const xpEarned = Math.round(score * (accuracy / 100));

    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ModernHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-12 pb-8 text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Great job training your emotional intelligence!
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{score}</div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{accuracy}%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold flex items-center justify-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    {xpEarned}
                  </div>
                  <div className="text-xs text-muted-foreground">XP Earned</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={startGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
                <Button variant="outline" onClick={() => router.push("/games")}>
                  All Games
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Game Intro Screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ModernHeader />
        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="absolute top-20 start-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

          <div className="container relative mx-auto px-4 py-12 md:py-16 max-w-2xl">
            <Card className="animate-slide-up">
              <CardHeader className="text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="h-8 w-8 text-purple-500" />
                </div>
                <CardTitle className="text-2xl">{game.name}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {game.instructions && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium mb-2">How to Play</h3>
                    <p className="text-sm text-muted-foreground">{game.instructions}</p>
                  </div>
                )}

                <div className="flex items-center justify-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{content.length} rounds</span>
                  </div>
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Zap className="w-4 h-4" />
                    <span>Up to {game.xpReward} XP</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={startGame}>
                  Start Game
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Game Play Screen
  const currentContent = content[currentRound];
  const progress = ((currentRound + 1) / content.length) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader />
      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />

        <div className="container relative mx-auto px-4 py-12 md:py-16 max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Round {currentRound + 1} of {content.length}
              </span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                {score} pts
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Game Content */}
          <Card className="animate-slide-up">
            <CardContent className="pt-8 pb-8">
              {/* Question/Scenario */}
              {currentContent.content.scenario && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm">{currentContent.content.scenario}</p>
                </div>
              )}

              {currentContent.content.question && (
                <h3 className="text-xl font-bold text-center mb-8">
                  {currentContent.content.question}
                </h3>
              )}

              {/* Image if emotion recognition */}
              {currentContent.content.imageUrl && (
                <div className="flex justify-center mb-8">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-6xl">
                    {currentContent.content.emotion &&
                      (EMOTION_ICONS[currentContent.content.emotion.toLowerCase()] ||
                        currentContent.content.emotion.charAt(0).toUpperCase())}
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                {(currentContent.content.options || []).map((option) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = currentContent.correctAnswer?.toLowerCase() === option.toLowerCase();

                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      disabled={showFeedback}
                      className={cn(
                        "p-4 rounded-xl border-2 text-center transition-all",
                        showFeedback
                          ? isCorrect
                            ? "border-green-500 bg-green-500/10"
                            : isSelected
                            ? "border-red-500 bg-red-500/10"
                            : "border-border opacity-50"
                          : "border-border hover:border-purple-500/50 hover:bg-purple-500/5"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {showFeedback && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {showFeedback && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Scenario Responses */}
              {currentContent.content.responses && (
                <div className="space-y-3">
                  {currentContent.content.responses.map((response, idx) => {
                    const isSelected = selectedAnswer === response.text;
                    const isBest = response.score === Math.max(...currentContent.content.responses!.map(r => r.score));

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(response.text)}
                        disabled={showFeedback}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-left transition-all",
                          showFeedback
                            ? isBest
                              ? "border-green-500 bg-green-500/10"
                              : isSelected
                              ? "border-yellow-500 bg-yellow-500/10"
                              : "border-border opacity-50"
                            : "border-border hover:border-purple-500/50 hover:bg-purple-500/5"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {showFeedback && isBest && (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          )}
                          <span>{response.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
