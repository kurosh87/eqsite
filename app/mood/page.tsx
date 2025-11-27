"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Smile,
  Meh,
  Frown,
  Heart,
  Zap,
  AlertCircle,
  Sun,
  Moon,
  Coffee,
  Home,
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  BookOpen,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MoodEntry {
  id: string;
  emotion: string;
  intensity: number;
  secondaryEmotions?: string[];
  triggers?: string[];
  notes?: string;
  context?: string;
  createdAt: string;
}

interface MoodStats {
  totalCheckIns: number;
  averageIntensity: number;
  mostCommonEmotion: string;
  emotionDistribution: Record<string, number>;
  weeklyTrend: number[];
}

const EMOTIONS = [
  { id: "happy", label: "Happy", emoji: "😊", color: "#22c55e" },
  { id: "calm", label: "Calm", emoji: "😌", color: "#3b82f6" },
  { id: "excited", label: "Excited", emoji: "🤩", color: "#f59e0b" },
  { id: "grateful", label: "Grateful", emoji: "🙏", color: "#ec4899" },
  { id: "neutral", label: "Neutral", emoji: "😐", color: "#6b7280" },
  { id: "anxious", label: "Anxious", emoji: "😰", color: "#f97316" },
  { id: "sad", label: "Sad", emoji: "😢", color: "#6366f1" },
  { id: "angry", label: "Angry", emoji: "😠", color: "#ef4444" },
  { id: "stressed", label: "Stressed", emoji: "😫", color: "#dc2626" },
  { id: "tired", label: "Tired", emoji: "😴", color: "#8b5cf6" },
];

const SECONDARY_EMOTIONS = [
  "hopeful", "confident", "loved", "proud", "content",
  "worried", "frustrated", "lonely", "overwhelmed", "confused",
  "inspired", "curious", "peaceful", "energetic", "focused",
];

const TRIGGERS = [
  { id: "work", label: "Work", icon: Briefcase },
  { id: "family", label: "Family", icon: Home },
  { id: "social", label: "Social", icon: Users },
  { id: "health", label: "Health", icon: Heart },
  { id: "money", label: "Money", icon: Zap },
  { id: "sleep", label: "Sleep", icon: Moon },
  { id: "exercise", label: "Exercise", icon: Sun },
  { id: "news", label: "News", icon: AlertCircle },
];

const CONTEXTS = [
  { id: "morning", label: "Morning", icon: Coffee },
  { id: "afternoon", label: "Afternoon", icon: Sun },
  { id: "evening", label: "Evening", icon: Moon },
  { id: "work", label: "At Work", icon: Briefcase },
  { id: "home", label: "At Home", icon: Home },
];

export default function MoodPage() {
  const [activeTab, setActiveTab] = useState("check-in");
  const [checkIns, setCheckIns] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Check-in form state
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [selectedSecondary, setSelectedSecondary] = useState<string[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [checkInsRes, statsRes] = await Promise.all([
        fetch("/api/mood/check-ins"),
        fetch("/api/mood/stats"),
      ]);

      if (checkInsRes.ok) {
        const data = await checkInsRes.json();
        setCheckIns(data.checkIns || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to load mood data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function submitCheckIn() {
    if (!selectedEmotion) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/mood/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion: selectedEmotion,
          intensity,
          secondaryEmotions: selectedSecondary,
          triggers: selectedTriggers,
          context: selectedContext,
          notes: notes.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        // Reset form after delay
        setTimeout(() => {
          setSelectedEmotion(null);
          setIntensity(3);
          setSelectedSecondary([]);
          setSelectedTriggers([]);
          setSelectedContext(null);
          setNotes("");
          setSubmitted(false);
          loadData();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to submit check-in:", error);
    } finally {
      setSubmitting(false);
    }
  }

  const toggleSecondary = (emotion: string) => {
    setSelectedSecondary(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : prev.length < 3 ? [...prev, emotion] : prev
    );
  };

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const getCheckInForDay = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkIns.find(c => {
      const checkInDate = new Date(c.createdAt);
      return checkInDate.toDateString() === date.toDateString();
    });
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted-foreground">
          Track your emotions to build self-awareness
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="check-in" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Check In
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Check-in Tab */}
        <TabsContent value="check-in">
          {submitted ? (
            <Card className="border-green-500/50 bg-green-500/5">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Check-in Recorded!</h3>
                <p className="text-muted-foreground">+5 XP earned</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Primary Emotion */}
              <Card>
                <CardHeader>
                  <CardTitle>How are you feeling?</CardTitle>
                  <CardDescription>Select your primary emotion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-3">
                    {EMOTIONS.map(emotion => (
                      <button
                        key={emotion.id}
                        onClick={() => setSelectedEmotion(emotion.id)}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-xl border-2 transition-all",
                          selectedEmotion === emotion.id
                            ? "border-primary bg-primary/5"
                            : "border-transparent bg-muted/50 hover:bg-muted"
                        )}
                      >
                        <span className="text-2xl mb-1">{emotion.emoji}</span>
                        <span className="text-xs font-medium">{emotion.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedEmotion && (
                <>
                  {/* Intensity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Intensity</CardTitle>
                      <CardDescription>How strong is this feeling? (1-5)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">Mild</span>
                        <div className="flex-1 flex gap-2">
                          {[1, 2, 3, 4, 5].map(level => (
                            <button
                              key={level}
                              onClick={() => setIntensity(level)}
                              className={cn(
                                "flex-1 h-12 rounded-lg font-medium transition-all",
                                intensity >= level
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-muted/80"
                              )}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <span className="text-muted-foreground">Intense</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Secondary Emotions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Any other feelings?</CardTitle>
                      <CardDescription>Select up to 3 (optional)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {SECONDARY_EMOTIONS.map(emotion => (
                          <Badge
                            key={emotion}
                            variant={selectedSecondary.includes(emotion) ? "default" : "outline"}
                            className="cursor-pointer capitalize"
                            onClick={() => toggleSecondary(emotion)}
                          >
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Triggers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>What triggered this?</CardTitle>
                      <CardDescription>Select all that apply (optional)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-3">
                        {TRIGGERS.map(trigger => {
                          const Icon = trigger.icon;
                          return (
                            <button
                              key={trigger.id}
                              onClick={() => toggleTrigger(trigger.id)}
                              className={cn(
                                "flex flex-col items-center p-3 rounded-lg border-2 transition-all",
                                selectedTriggers.includes(trigger.id)
                                  ? "border-primary bg-primary/5"
                                  : "border-transparent bg-muted/50 hover:bg-muted"
                              )}
                            >
                              <Icon className="h-5 w-5 mb-1" />
                              <span className="text-xs">{trigger.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Context */}
                  <Card>
                    <CardHeader>
                      <CardTitle>When/Where?</CardTitle>
                      <CardDescription>Optional context</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {CONTEXTS.map(ctx => {
                          const Icon = ctx.icon;
                          return (
                            <button
                              key={ctx.id}
                              onClick={() => setSelectedContext(selectedContext === ctx.id ? null : ctx.id)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all",
                                selectedContext === ctx.id
                                  ? "border-primary bg-primary/5"
                                  : "border-transparent bg-muted/50 hover:bg-muted"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="text-sm">{ctx.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Anything else?</CardTitle>
                      <CardDescription>Add a note (optional)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        placeholder="What's on your mind..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={3}
                      />
                    </CardContent>
                  </Card>

                  {/* Submit */}
                  <Button
                    onClick={submitCheckIn}
                    disabled={submitting}
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? "Saving..." : "Save Check-in"}
                  </Button>
                </>
              )}
            </div>
          )}
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const checkIn = getCheckInForDay(day);
                  const emotion = checkIn ? EMOTIONS.find(e => e.id === checkIn.emotion) : null;
                  const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();

                  return (
                    <div
                      key={day}
                      className={cn(
                        "aspect-square flex flex-col items-center justify-center rounded-lg transition-colors",
                        isToday && "ring-2 ring-primary",
                        checkIn ? "bg-muted/50" : "hover:bg-muted/30"
                      )}
                    >
                      <span className={cn("text-sm", isToday && "font-bold")}>{day}</span>
                      {emotion && (
                        <span className="text-lg">{emotion.emoji}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Check-ins */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              {checkIns.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No check-ins yet. Start tracking your mood!
                </p>
              ) : (
                <div className="space-y-4">
                  {checkIns.slice(0, 7).map(checkIn => {
                    const emotion = EMOTIONS.find(e => e.id === checkIn.emotion);
                    return (
                      <div key={checkIn.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                        <span className="text-2xl">{emotion?.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{checkIn.emotion}</span>
                            <span className="text-xs text-muted-foreground">
                              Intensity: {checkIn.intensity}/5
                            </span>
                          </div>
                          {checkIn.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {checkIn.notes}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(checkIn.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          {stats ? (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.totalCheckIns}</div>
                    <p className="text-sm text-muted-foreground">Total Check-ins</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.averageIntensity.toFixed(1)}</div>
                    <p className="text-sm text-muted-foreground">Avg Intensity</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold capitalize">{stats.mostCommonEmotion}</div>
                    <p className="text-sm text-muted-foreground">Most Common</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{checkIns.length > 0 ? checkIns.length : 0}</div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Emotion Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Emotion Distribution</CardTitle>
                  <CardDescription>Your emotions over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.emotionDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([emotion, count]) => {
                        const emotionData = EMOTIONS.find(e => e.id === emotion);
                        const percentage = Math.round((count / stats.totalCheckIns) * 100);
                        return (
                          <div key={emotion} className="flex items-center gap-3">
                            <span className="text-xl w-8">{emotionData?.emoji}</span>
                            <span className="w-20 text-sm capitalize">{emotion}</span>
                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: emotionData?.color || "#6b7280",
                                }}
                              />
                            </div>
                            <span className="w-12 text-sm text-right text-muted-foreground">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Mood Trend</CardTitle>
                  <CardDescription>Average intensity by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between h-32 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                      const value = stats.weeklyTrend[i] || 0;
                      const height = value > 0 ? (value / 5) * 100 : 10;
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-primary/70 rounded-t transition-all"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Smile className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Not enough data yet</h3>
                <p className="text-muted-foreground mb-4">
                  Complete a few check-ins to see your mood patterns
                </p>
                <Button onClick={() => setActiveTab("check-in")}>
                  Start Tracking
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
