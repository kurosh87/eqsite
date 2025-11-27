"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Clock, FileQuestion, Lock, Sparkles } from "lucide-react";

interface AssessmentType {
  id: string;
  slug: string;
  name: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  isPremium: boolean;
}

export default function AssessmentPage() {
  const router = useRouter();
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessmentTypes();
  }, []);

  async function fetchAssessmentTypes() {
    try {
      const res = await fetch("/api/assessments");
      const data = await res.json();
      setAssessmentTypes(data.assessmentTypes || []);
    } catch (error) {
      console.error("Failed to fetch assessment types:", error);
    } finally {
      setLoading(false);
    }
  }

  async function startAssessment(slug: string) {
    setStarting(slug);
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentTypeSlug: slug }),
      });

      if (!res.ok) {
        throw new Error("Failed to start assessment");
      }

      const data = await res.json();
      router.push(`/assessment/${data.assessment.id}`);
    } catch (error) {
      console.error("Failed to start assessment:", error);
      setStarting(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <Sparkles className="w-3 h-3 mr-1" />
          EQ Assessment
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Discover Your Emotional Intelligence
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose an assessment to measure your emotional intelligence across five key domains.
          Get personalized insights and recommendations to grow.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {assessmentTypes.map((type) => (
          <Card
            key={type.id}
            className={`relative overflow-hidden transition-all hover:shadow-lg ${
              type.isPremium ? "border-amber-500/50" : ""
            }`}
          >
            {type.isPremium && (
              <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                Premium
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {type.name}
                {type.isPremium && <Lock className="w-4 h-4 text-amber-500" />}
              </CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <FileQuestion className="w-4 h-4" />
                  {type.questionCount} questions
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ~{type.estimatedMinutes} min
                </div>
              </div>
              <Button
                className="w-full"
                variant={type.isPremium ? "outline" : "default"}
                onClick={() => startAssessment(type.slug)}
                disabled={starting !== null}
              >
                {starting === type.slug ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Starting...
                  </>
                ) : type.isPremium ? (
                  "Unlock with Pro"
                ) : (
                  "Start Assessment"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">What to Expect</h3>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>• Answer honestly for the most accurate results</li>
          <li>• There are no right or wrong answers</li>
          <li>• Your results are private and secure</li>
          <li>• You can retake assessments to track your progress</li>
        </ul>
      </div>
    </div>
  );
}
