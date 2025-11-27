"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  Heart,
  Smile,
  Meh,
  Frown,
  Angry,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Emotion {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const PRIMARY_EMOTIONS: Emotion[] = [
  { id: "happy", name: "Happy", icon: <Smile className="w-8 h-8" />, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { id: "calm", name: "Calm", icon: <Heart className="w-8 h-8" />, color: "text-green-500", bgColor: "bg-green-500/10" },
  { id: "neutral", name: "Neutral", icon: <Meh className="w-8 h-8" />, color: "text-gray-500", bgColor: "bg-gray-500/10" },
  { id: "sad", name: "Sad", icon: <Frown className="w-8 h-8" />, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { id: "anxious", name: "Anxious", icon: <Zap className="w-8 h-8" />, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { id: "angry", name: "Angry", icon: <Angry className="w-8 h-8" />, color: "text-red-500", bgColor: "bg-red-500/10" },
];

const SECONDARY_EMOTIONS: Record<string, string[]> = {
  happy: ["Excited", "Grateful", "Proud", "Content", "Hopeful", "Joyful"],
  calm: ["Peaceful", "Relaxed", "Centered", "Balanced", "Serene", "Mindful"],
  neutral: ["Indifferent", "Okay", "Stable", "Unbothered", "Balanced"],
  sad: ["Disappointed", "Lonely", "Hurt", "Tired", "Lost", "Melancholy"],
  anxious: ["Nervous", "Worried", "Overwhelmed", "Stressed", "Uncertain", "Restless"],
  angry: ["Frustrated", "Irritated", "Annoyed", "Resentful", "Impatient"],
};

const TRIGGERS = [
  "Work/School",
  "Relationships",
  "Health",
  "Finance",
  "Family",
  "Friends",
  "Sleep",
  "Exercise",
  "Weather",
  "News",
  "Social Media",
  "Other",
];

const INTENSITY_LEVELS = [
  { value: 1, label: "Barely noticeable" },
  { value: 2, label: "Mild" },
  { value: 3, label: "Moderate" },
  { value: 4, label: "Strong" },
  { value: 5, label: "Intense" },
];

export default function CheckInPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [secondaryEmotions, setSecondaryEmotions] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleSecondaryToggle = (emotion: string) => {
    setSecondaryEmotions((prev) =>
      prev.includes(emotion)
        ? prev.filter((e) => e !== emotion)
        : [...prev, emotion]
    );
  };

  const handleTriggerToggle = (trigger: string) => {
    setTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  async function handleSubmit() {
    if (!selectedEmotion) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion: selectedEmotion,
          intensity,
          secondaryEmotions,
          triggers,
          notes: notes.trim() || undefined,
        }),
      });

      if (res.ok) {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Failed to submit check-in:", error);
    } finally {
      setSubmitting(false);
    }
  }

  if (completed) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <ModernHeader />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-12 pb-8">
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check-In Complete!</h2>
              <p className="text-muted-foreground mb-6">
                Great job taking a moment to reflect on your emotions. Self-awareness is the
                first step to emotional intelligence.
              </p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">+5 XP earned!</span>
              </div>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push("/dashboard")}>
                  Go to Dashboard
                </Button>
                <Button variant="outline" onClick={() => {
                  setCompleted(false);
                  setStep(1);
                  setSelectedEmotion(null);
                  setIntensity(3);
                  setSecondaryEmotions([]);
                  setTriggers([]);
                  setNotes("");
                }}>
                  New Check-In
                </Button>
              </div>
            </CardContent>
          </Card>
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
        <div className="absolute top-20 start-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="container relative mx-auto px-4 py-12 md:py-16 max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center shadow-lg mx-auto mb-4">
              <Heart className="h-7 w-7 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              Emotion Check-In
            </h1>
            <p className="text-muted-foreground">
              Take a moment to reflect on how you&apos;re feeling
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 w-12 rounded-full transition-all",
                  s <= step ? "bg-green-500" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Step 1: Primary Emotion */}
          {step === 1 && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>How are you feeling right now?</CardTitle>
                <CardDescription>
                  Select the emotion that best describes your current state
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {PRIMARY_EMOTIONS.map((emotion) => (
                    <button
                      key={emotion.id}
                      onClick={() => setSelectedEmotion(emotion.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:scale-105",
                        selectedEmotion === emotion.id
                          ? `${emotion.bgColor} border-current ${emotion.color}`
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn("flex flex-col items-center gap-2", emotion.color)}>
                        {emotion.icon}
                        <span className="font-medium text-foreground">{emotion.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedEmotion && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">
                      How intense is this feeling?
                    </label>
                    <div className="flex justify-between gap-2">
                      {INTENSITY_LEVELS.map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setIntensity(level.value)}
                          className={cn(
                            "flex-1 p-3 rounded-lg border-2 transition-all text-center",
                            intensity === level.value
                              ? "border-green-500 bg-green-500/10"
                              : "border-border hover:border-green-500/50"
                          )}
                        >
                          <div className="text-lg font-bold">{level.value}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {level.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={!selectedEmotion}
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Secondary Emotions & Triggers */}
          {step === 2 && selectedEmotion && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Tell us more</CardTitle>
                <CardDescription>
                  Select any secondary emotions and potential triggers (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    Any other feelings? (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SECONDARY_EMOTIONS[selectedEmotion]?.map((emotion) => (
                      <Badge
                        key={emotion}
                        variant={secondaryEmotions.includes(emotion) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          secondaryEmotions.includes(emotion) && "bg-green-500"
                        )}
                        onClick={() => handleSecondaryToggle(emotion)}
                      >
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">
                    What might be influencing this feeling? (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TRIGGERS.map((trigger) => (
                      <Badge
                        key={trigger}
                        variant={triggers.includes(trigger) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          triggers.includes(trigger) && "bg-green-500"
                        )}
                        onClick={() => handleTriggerToggle(trigger)}
                      >
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(3)}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Notes & Submit */}
          {step === 3 && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Any additional thoughts?</CardTitle>
                <CardDescription>
                  Add a note to help you remember the context later (optional)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What's on your mind? Any specific events or thoughts contributing to how you feel?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mb-6"
                />

                {/* Summary */}
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <div className="text-sm font-medium mb-2">Your Check-In Summary</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Primary:</span>
                      <Badge>{PRIMARY_EMOTIONS.find(e => e.id === selectedEmotion)?.name}</Badge>
                      <span className="text-muted-foreground">Intensity:</span>
                      <Badge variant="outline">{intensity}/5</Badge>
                    </div>
                    {secondaryEmotions.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-muted-foreground">Also feeling:</span>
                        {secondaryEmotions.map(e => (
                          <Badge key={e} variant="secondary">{e}</Badge>
                        ))}
                      </div>
                    )}
                    {triggers.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-muted-foreground">Triggers:</span>
                        {triggers.map(t => (
                          <Badge key={t} variant="secondary">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner className="w-4 h-4 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Complete Check-In
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tip */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Regular check-ins help build emotional awareness and can improve your EQ over time.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
