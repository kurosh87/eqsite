"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Trophy,
  Target,
  TrendingUp,
  Share2,
  RotateCcw,
  ArrowRight,
  Star,
  Brain,
  Heart,
  Shield,
  Flame,
  Users,
} from "lucide-react";

interface DomainScore {
  slug: string;
  name: string;
  color: string;
  score: number;
}

interface AssessmentResult {
  assessment: {
    id: string;
    status: string;
    completedAt: string;
    timeTaken: number;
    overallScore: number;
    percentile: number;
    domainScores: DomainScore[];
  };
  assessmentType: {
    name: string;
    slug: string;
  };
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

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [assessmentId]);

  async function fetchResults() {
    try {
      const res = await fetch(`/api/assessments/${assessmentId}`);
      if (!res.ok) {
        router.push("/assessment");
        return;
      }

      const data = await res.json();

      if (data.assessment.status !== "completed") {
        router.push(`/assessment/${assessmentId}`);
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      router.push("/assessment");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { assessment, assessmentType } = result;
  const overallLevel = getScoreLevel(assessment.overallScore);

  // Sort domains by score
  const sortedDomains = [...(assessment.domainScores || [])].sort(
    (a, b) => b.score - a.score
  );
  const strengths = sortedDomains.slice(0, 2);
  const areasForGrowth = sortedDomains.slice(-2).reverse();

  return (
    <div className="container max-w-4xl py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <Trophy className="w-3 h-3 mr-1" />
          Assessment Complete
        </Badge>
        <h1 className="text-4xl font-bold mb-4">Your EQ Results</h1>
        <p className="text-muted-foreground">
          {assessmentType.name} • Completed in {formatTime(assessment.timeTaken || 0)}
        </p>
      </div>

      {/* Overall Score Card */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="fill-none stroke-muted stroke-[8]"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="fill-none stroke-primary stroke-[8]"
                  strokeDasharray={`${(assessment.overallScore / 100) * 440} 440`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{assessment.overallScore}</span>
                <span className="text-sm text-muted-foreground">out of 100</span>
              </div>
            </div>

            {/* Score Details */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">
                <span className={overallLevel.color}>{overallLevel.label}</span> EQ
              </h2>
              <p className="text-muted-foreground mb-4">
                You scored higher than{" "}
                <span className="font-semibold text-foreground">
                  {assessment.percentile}%
                </span>{" "}
                of people who took this assessment.
              </p>
              <div className="flex gap-4 justify-center md:justify-start">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/assessment")}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Domain Scores */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Domain Scores
          </CardTitle>
          <CardDescription>
            Your performance across the five emotional intelligence domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {sortedDomains.map((domain) => {
              const level = getScoreLevel(domain.score);
              return (
                <div key={domain.slug}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${domain.color}20` }}
                      >
                        <span style={{ color: domain.color }}>
                          {DOMAIN_ICONS[domain.slug]}
                        </span>
                      </div>
                      <span className="font-medium">{domain.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${level.color}`}>{level.label}</span>
                      <span className="font-bold">{domain.score}%</span>
                    </div>
                  </div>
                  <Progress
                    value={domain.score}
                    className="h-3"
                    style={
                      {
                        "--progress-background": domain.color,
                      } as React.CSSProperties
                    }
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Growth Areas */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Strengths */}
        <Card className="border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Star className="w-5 h-5" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {strengths.map((domain) => (
                <li key={domain.slug} className="flex items-start gap-3">
                  <div
                    className="p-1.5 rounded"
                    style={{ backgroundColor: `${domain.color}20` }}
                  >
                    <span style={{ color: domain.color }}>
                      {DOMAIN_ICONS[domain.slug]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{domain.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Score: {domain.score}%
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Growth Areas */}
        <Card className="border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <TrendingUp className="w-5 h-5" />
              Areas for Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {areasForGrowth.map((domain) => (
                <li key={domain.slug} className="flex items-start gap-3">
                  <div
                    className="p-1.5 rounded"
                    style={{ backgroundColor: `${domain.color}20` }}
                  >
                    <span style={{ color: domain.color }}>
                      {DOMAIN_ICONS[domain.slug]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{domain.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Score: {domain.score}%
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                Ready to Improve Your EQ?
              </h3>
              <p className="text-muted-foreground">
                Explore exercises, games, and daily challenges designed to help you
                develop your emotional intelligence.
              </p>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => router.push("/games")}>
                Play Games
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
