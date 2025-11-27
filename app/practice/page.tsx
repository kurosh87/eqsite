"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Brain,
  Heart,
  Shield,
  Flame,
  Users,
  RotateCcw,
  Check,
  X,
  ChevronRight,
  Lightbulb,
  Clock,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";

interface FlashCard {
  id: string;
  category: "concept" | "scenario" | "reflection" | "skill";
  domain: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: string;
  nextReview?: string;
  repetitions: number;
  easeFactor: number;
}

// Mock flashcard data - in production, would come from API/database
const MOCK_CARDS: FlashCard[] = [
  {
    id: "1",
    category: "concept",
    domain: "self-awareness",
    front: "What is emotional self-awareness?",
    back: "The ability to recognize and understand your own emotions as they happen, including how they affect your thoughts and behavior.",
    difficulty: "easy",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "2",
    category: "scenario",
    domain: "self-regulation",
    front: "A colleague criticizes your work in front of others. What's the best first response?",
    back: "Take a breath, acknowledge the feedback calmly, and suggest discussing specifics privately. This demonstrates self-regulation and maintains professional composure.",
    difficulty: "medium",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "3",
    category: "skill",
    domain: "empathy",
    front: "Name 3 techniques for active listening.",
    back: "1. Maintain eye contact and open body language\n2. Reflect back what you've heard (paraphrasing)\n3. Ask clarifying questions to show understanding",
    difficulty: "medium",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "4",
    category: "reflection",
    domain: "motivation",
    front: "Think of a recent setback. What did you learn from it?",
    back: "Reflect on: What went wrong? What was in your control? What would you do differently? How can this make you stronger?",
    difficulty: "hard",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "5",
    category: "concept",
    domain: "social-skills",
    front: "What is 'emotional contagion'?",
    back: "The phenomenon where emotions spread from person to person, like a 'ripple effect.' A leader's mood can significantly impact their entire team's emotional state.",
    difficulty: "medium",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "6",
    category: "scenario",
    domain: "empathy",
    front: "A friend shares they're going through a difficult time but doesn't want advice. How do you respond?",
    back: "Simply listen and validate their feelings: 'That sounds really tough. I'm here for you.' Sometimes people just need to feel heard, not fixed.",
    difficulty: "easy",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "7",
    category: "skill",
    domain: "self-regulation",
    front: "What is the 'STOP' technique for emotional regulation?",
    back: "S - Stop what you're doing\nT - Take a breath\nO - Observe your thoughts and feelings\nP - Proceed mindfully",
    difficulty: "easy",
    repetitions: 0,
    easeFactor: 2.5,
  },
  {
    id: "8",
    category: "concept",
    domain: "self-awareness",
    front: "What's the difference between emotions and feelings?",
    back: "Emotions are automatic physiological responses to stimuli. Feelings are the conscious experience and interpretation of those emotions. Emotions happen TO us; feelings are how we make sense of them.",
    difficulty: "hard",
    repetitions: 0,
    easeFactor: 2.5,
  },
];

const DOMAIN_INFO = {
  "self-awareness": { icon: Brain, color: "#3b82f6", label: "Self-Awareness" },
  "self-regulation": { icon: Shield, color: "#10b981", label: "Self-Regulation" },
  "motivation": { icon: Flame, color: "#f59e0b", label: "Motivation" },
  "empathy": { icon: Heart, color: "#ec4899", label: "Empathy" },
  "social-skills": { icon: Users, color: "#8b5cf6", label: "Social Skills" },
};

const CATEGORY_STYLES = {
  concept: { label: "Concept", color: "bg-blue-500" },
  scenario: { label: "Scenario", color: "bg-amber-500" },
  reflection: { label: "Reflection", color: "bg-purple-500" },
  skill: { label: "Skill", color: "bg-green-500" },
};

export default function PracticePage() {
  const [cards, setCards] = useState<FlashCard[]>(MOCK_CARDS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0,
    xpEarned: 0,
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentCard = cards[currentCardIndex];
  const domain = currentCard ? DOMAIN_INFO[currentCard.domain as keyof typeof DOMAIN_INFO] : null;
  const Icon = domain?.icon || Brain;

  function startSession() {
    // Shuffle cards for variety
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setSessionStats({ reviewed: 0, correct: 0, incorrect: 0, xpEarned: 0 });
    setIsSessionActive(true);
    setShowResults(false);
  }

  function flipCard() {
    setIsFlipped(true);
  }

  function rateCard(rating: "easy" | "good" | "hard" | "again") {
    // Calculate XP based on rating
    const xpMap = { easy: 15, good: 10, hard: 5, again: 2 };
    const xp = xpMap[rating];

    // Update stats
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: rating !== "again" ? prev.correct + 1 : prev.correct,
      incorrect: rating === "again" ? prev.incorrect + 1 : prev.incorrect,
      xpEarned: prev.xpEarned + xp,
    }));

    // Move to next card or end session
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setShowResults(true);
      setIsSessionActive(false);
    }
  }

  // Results screen
  if (showResults) {
    const accuracy = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0;

    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
            <p className="text-muted-foreground mb-8">Great work on your practice session</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-primary">{sessionStats.reviewed}</p>
                <p className="text-sm text-muted-foreground">Cards Reviewed</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-green-500">{accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold text-amber-500">+{sessionStats.xpEarned}</p>
                <p className="text-sm text-muted-foreground">XP Earned</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Back to Menu
              </Button>
              <Button onClick={startSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session active - show flashcard
  if (isSessionActive && currentCard) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Card {currentCardIndex + 1} of {cards.length}
            </span>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              {sessionStats.xpEarned} XP
            </Badge>
          </div>
          <Progress value={(currentCardIndex / cards.length) * 100} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="perspective-1000">
          <Card
            className={cn(
              "min-h-[400px] cursor-pointer transition-all duration-500 transform-style-preserve-3d",
              isFlipped && "rotate-y-180"
            )}
            onClick={() => !isFlipped && flipCard()}
          >
            {/* Front of card */}
            <div className={cn("absolute inset-0 backface-hidden", isFlipped && "invisible")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${domain?.color}20`, color: domain?.color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{domain?.label}</span>
                  </div>
                  <Badge className={CATEGORY_STYLES[currentCard.category].color}>
                    {CATEGORY_STYLES[currentCard.category].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[280px] text-center">
                <Lightbulb className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-xl font-medium mb-6">{currentCard.front}</p>
                <p className="text-sm text-muted-foreground">
                  Tap to reveal answer
                </p>
              </CardContent>
            </div>

            {/* Back of card */}
            <div className={cn(
              "absolute inset-0 backface-hidden rotate-y-180 bg-card",
              !isFlipped && "invisible"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Answer</span>
                  <Badge variant="outline">
                    {currentCard.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="min-h-[280px]">
                <p className="text-lg whitespace-pre-line">{currentCard.back}</p>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Rating Buttons */}
        {isFlipped && (
          <div className="mt-6 space-y-3">
            <p className="text-center text-sm text-muted-foreground mb-4">
              How well did you know this?
            </p>
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="outline"
                className="border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => rateCard("again")}
              >
                <X className="h-4 w-4 mr-1" />
                Again
              </Button>
              <Button
                variant="outline"
                className="border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-500"
                onClick={() => rateCard("hard")}
              >
                Hard
              </Button>
              <Button
                variant="outline"
                className="border-green-500/50 hover:bg-green-500/10 hover:text-green-500"
                onClick={() => rateCard("good")}
              >
                Good
              </Button>
              <Button
                variant="outline"
                className="border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-500"
                onClick={() => rateCard("easy")}
              >
                <Check className="h-4 w-4 mr-1" />
                Easy
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Main menu
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          Practice
        </h1>
        <p className="text-muted-foreground">
          Strengthen your EQ knowledge with spaced repetition
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{cards.length}</div>
            <p className="text-sm text-muted-foreground">Cards to Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">5</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">Cards Mastered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">85%</div>
            <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Start Session */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Daily Review
          </CardTitle>
          <CardDescription>
            {cards.length} cards due for review today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                ~{Math.ceil(cards.length * 0.5)} min
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-amber-500" />
                ~{cards.length * 10} XP
              </div>
            </div>
            <Button onClick={startSession} size="lg">
              Start Review
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card Categories */}
      <h2 className="text-lg font-semibold mb-4">Browse by Category</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(CATEGORY_STYLES).map(([key, style]) => {
          const count = cards.filter(c => c.category === key).length;
          return (
            <Card key={key} className="cursor-pointer hover:bg-muted/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", style.color)}>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{style.label} Cards</h3>
                    <p className="text-sm text-muted-foreground">
                      {count} cards available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
