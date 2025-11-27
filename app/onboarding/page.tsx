"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Brain,
  Heart,
  Shield,
  Flame,
  Users,
  ArrowRight,
  ArrowLeft,
  Target,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface Domain {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const GOALS: Goal[] = [
  {
    id: "self-improvement",
    title: "Personal Growth",
    description: "Understand myself better and grow as a person",
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: "relationships",
    title: "Better Relationships",
    description: "Improve my connections with family and friends",
    icon: <Heart className="w-6 h-6" />,
  },
  {
    id: "career",
    title: "Career Success",
    description: "Become a better leader and colleague",
    icon: <Target className="w-6 h-6" />,
  },
  {
    id: "stress",
    title: "Manage Stress",
    description: "Handle emotions and pressure better",
    icon: <Shield className="w-6 h-6" />,
  },
];

const DOMAINS: Domain[] = [
  {
    id: "self-awareness",
    slug: "self-awareness",
    name: "Self-Awareness",
    description: "Understanding your emotions and their impact",
    icon: <Brain className="w-6 h-6" />,
    color: "#3b82f6",
  },
  {
    id: "self-regulation",
    slug: "self-regulation",
    name: "Self-Regulation",
    description: "Managing your emotional responses",
    icon: <Shield className="w-6 h-6" />,
    color: "#10b981",
  },
  {
    id: "motivation",
    slug: "motivation",
    name: "Motivation",
    description: "Inner drive and perseverance",
    icon: <Flame className="w-6 h-6" />,
    color: "#f59e0b",
  },
  {
    id: "empathy",
    slug: "empathy",
    name: "Empathy",
    description: "Understanding others' emotions",
    icon: <Heart className="w-6 h-6" />,
    color: "#ec4899",
  },
  {
    id: "social-skills",
    slug: "social-skills",
    name: "Social Skills",
    description: "Building and managing relationships",
    icon: <Users className="w-6 h-6" />,
    color: "#8b5cf6",
  },
];

const EXPERIENCE_LEVELS = [
  { id: "new", label: "New to EQ", description: "I'm just starting to learn" },
  { id: "some", label: "Some knowledge", description: "I've read about it before" },
  { id: "experienced", label: "Experienced", description: "I actively work on my EQ" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [focusDomains, setFocusDomains] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleDomain = (domainId: string) => {
    setFocusDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : prev.length < 3
        ? [...prev, domainId]
        : prev
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true; // Welcome step
      case 2:
        return selectedGoals.length > 0;
      case 3:
        return focusDomains.length > 0;
      case 4:
        return experience !== "";
      default:
        return false;
    }
  };

  async function completeOnboarding() {
    setSaving(true);
    try {
      await fetch("/api/user/stats", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          focusAreas: focusDomains,
          goals: selectedGoals,
          experience,
          onboardingCompleted: true,
        }),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to save onboarding:", error);
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col">
      {/* Progress Header */}
      <div className="container max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Skip
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center animate-fade-in">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Brain className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Welcome to EQ Platform</h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto">
                Let&apos;s personalize your experience to help you grow your emotional intelligence.
              </p>
              <Button size="lg" onClick={() => setStep(2)}>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">What brings you here?</h2>
                <p className="text-muted-foreground">
                  Select one or more goals (we&apos;ll tailor your experience)
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={cn(
                      "p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                      selectedGoals.includes(goal.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center",
                          selectedGoals.includes(goal.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {goal.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{goal.title}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      {selectedGoals.includes(goal.id) && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Focus Areas */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Choose your focus areas</h2>
                <p className="text-muted-foreground">
                  Select up to 3 domains you want to improve (you can change this later)
                </p>
              </div>
              <div className="space-y-4 mb-8">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    disabled={focusDomains.length >= 3 && !focusDomains.includes(domain.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all",
                      focusDomains.includes(domain.id)
                        ? "border-current"
                        : "border-border hover:border-primary/50",
                      focusDomains.length >= 3 && !focusDomains.includes(domain.id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    )}
                    style={{
                      borderColor: focusDomains.includes(domain.id) ? domain.color : undefined,
                      backgroundColor: focusDomains.includes(domain.id) ? `${domain.color}10` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{
                          backgroundColor: `${domain.color}20`,
                          color: domain.color,
                        }}
                      >
                        {domain.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{domain.name}</h3>
                        <p className="text-sm text-muted-foreground">{domain.description}</p>
                      </div>
                      {focusDomains.includes(domain.id) && (
                        <CheckCircle className="w-5 h-5" style={{ color: domain.color }} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {focusDomains.length}/3 selected
              </p>
            </div>
          )}

          {/* Step 4: Experience Level */}
          {step === 4 && (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">How familiar are you with EQ?</h2>
                <p className="text-muted-foreground">
                  This helps us adjust the content to your level
                </p>
              </div>
              <div className="space-y-4 mb-8 max-w-md mx-auto">
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setExperience(level.id)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg",
                      experience === level.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{level.label}</h3>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      {experience === level.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {step > 1 && (
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              {step < totalSteps ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={completeOnboarding} disabled={!canProceed() || saving}>
                  {saving ? "Saving..." : "Start My Journey"}
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
