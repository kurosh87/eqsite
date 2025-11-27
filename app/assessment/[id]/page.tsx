"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  type: "likert" | "scenario" | "multiple-choice";
  scenario?: string;
  options?: Array<{
    value: number;
    label: string;
    description?: string;
  }>;
  domain: {
    slug: string;
    name: string;
    color: string;
  };
}

interface AssessmentData {
  assessment: {
    id: string;
    status: string;
  };
  assessmentType: {
    name: string;
    questionCount: number;
  };
  questions: Question[];
}

const LIKERT_OPTIONS: Array<{ value: number; label: string; description?: string }> = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

export default function TakeAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assessmentId = params.id as string;

  const [data, setData] = useState<AssessmentData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  async function fetchAssessment() {
    try {
      // First check if assessment exists and get questions
      const res = await fetch(`/api/assessments/${assessmentId}`);
      if (!res.ok) {
        // Assessment doesn't exist yet, need to create it
        router.push("/assessment");
        return;
      }

      const existingData = await res.json();

      // If completed, redirect to results
      if (existingData.assessment.status === "completed") {
        router.push(`/results/${assessmentId}`);
        return;
      }

      // Need to get questions - fetch from start assessment endpoint
      // For now, just redirect to start
      router.push("/assessment");
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
      router.push("/assessment");
    } finally {
      setLoading(false);
    }
  }

  // This is called when starting a new assessment
  const initializeAssessment = useCallback((assessmentData: AssessmentData) => {
    setData(assessmentData);
    setLoading(false);
    setQuestionStartTime(Date.now());
  }, []);

  // Expose initialize function for parent to call
  useEffect(() => {
    // Check session storage for assessment data
    const storedData = sessionStorage.getItem(`assessment_${assessmentId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      initializeAssessment(parsed);
    }
  }, [assessmentId, initializeAssessment]);

  const currentQuestion = data?.questions[currentIndex];
  const progress = data ? ((currentIndex + 1) / data.questions.length) * 100 : 0;
  const hasAnswer = currentQuestion ? responses[currentQuestion.id] !== undefined : false;

  async function submitResponse(questionId: string, value: number) {
    setResponses((prev) => ({ ...prev, [questionId]: value }));

    const responseTime = Date.now() - questionStartTime;

    try {
      await fetch(`/api/assessments/${assessmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_response",
          questionId,
          response: value,
          responseTime,
        }),
      });
    } catch (error) {
      console.error("Failed to submit response:", error);
    }

    setQuestionStartTime(Date.now());
  }

  function goNext() {
    if (currentIndex < (data?.questions.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
      setQuestionStartTime(Date.now());
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setQuestionStartTime(Date.now());
    }
  }

  async function completeAssessment() {
    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    try {
      const res = await fetch(`/api/assessments/${assessmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "complete",
          timeTaken,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to complete assessment");
      }

      // Clear session storage
      sessionStorage.removeItem(`assessment_${assessmentId}`);

      // Redirect to results
      router.push(`/results/${assessmentId}`);
    } catch (error) {
      console.error("Failed to complete assessment:", error);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Assessment not found or has been completed.
            </p>
            <Button onClick={() => router.push("/assessment")}>
              Start New Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLastQuestion = currentIndex === data.questions.length - 1;
  const allAnswered = data.questions.every((q) => responses[q.id] !== undefined);
  const options = currentQuestion.options || LIKERT_OPTIONS;

  return (
    <div className="container max-w-3xl py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{data.assessmentType.name}</span>
          <span className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {data.questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Domain Badge */}
      <div
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6"
        style={{
          backgroundColor: `${currentQuestion.domain.color}20`,
          color: currentQuestion.domain.color,
        }}
      >
        {currentQuestion.domain.name}
      </div>

      {/* Question Card */}
      <Card className="mb-8">
        <CardHeader>
          {currentQuestion.scenario && (
            <div className="bg-muted p-4 rounded-lg mb-4 text-sm">
              <span className="font-medium">Scenario: </span>
              {currentQuestion.scenario}
            </div>
          )}
          <CardTitle className="text-xl font-normal leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => submitResponse(currentQuestion.id, option.value)}
                className={cn(
                  "w-full p-4 rounded-lg border-2 text-left transition-all",
                  "hover:border-primary/50 hover:bg-primary/5",
                  responses[currentQuestion.id] === option.value
                    ? "border-primary bg-primary/10"
                    : "border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      responses[currentQuestion.id] === option.value
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    )}
                  >
                    {responses[currentQuestion.id] === option.value && (
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={completeAssessment}
            disabled={!allAnswered || submitting}
          >
            {submitting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Calculating Results...
              </>
            ) : (
              <>
                Complete Assessment
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={goNext} disabled={!hasAnswer}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground mb-3">Quick Navigation</div>
        <div className="flex flex-wrap gap-2">
          {data.questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "w-8 h-8 rounded-full text-sm font-medium transition-all",
                currentIndex === idx
                  ? "bg-primary text-primary-foreground"
                  : responses[q.id] !== undefined
                  ? "bg-green-500/20 text-green-700"
                  : "bg-muted hover:bg-muted-foreground/20"
              )}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
