"use client";

import { useState, useEffect, useRef } from "react";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Sparkles,
  Send,
  Lightbulb,
  Target,
  TrendingUp,
  Heart,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface Insights {
  summary: string;
  strength: {
    title: string;
    description: string;
  };
  growthArea: {
    title: string;
    exercises: string[];
  };
  dailyTip: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function CoachPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [context, setContext] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchInsights() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/insights");
      if (res.ok) {
        const data = await res.json();
        setInsights(data.insights);
        setContext(data.context);
      } else if (res.status === 503) {
        setError("AI coaching requires an API key. Add ANTHROPIC_API_KEY to enable.");
      }
    } catch (err) {
      console.error("Failed to fetch insights:", err);
      setError("Failed to load insights. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage() {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage, context }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, I couldn't process your question. Please try again." },
        ]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  const suggestedQuestions = [
    "How can I improve my empathy?",
    "What exercises help with self-regulation?",
    "How do I handle conflict better?",
    "Tips for active listening?",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader />

      <main className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="absolute top-20 start-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

        <div className="container relative mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center shadow-lg">
                <Sparkles className="h-7 w-7 text-purple-500" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  AI EQ Coach
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Personalized guidance to improve your emotional intelligence
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner className="h-8 w-8" />
            </div>
          ) : error ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-8 pb-8 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold mb-2">AI Coach Unavailable</h3>
                <p className="text-muted-foreground text-sm mb-4">{error}</p>
                <Button variant="outline" onClick={fetchInsights}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : !insights ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-8 pb-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold mb-2">Take an Assessment First</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Complete an EQ assessment to receive personalized AI coaching.
                </p>
                <Link href="/assessment">
                  <Button>Start Assessment</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Insights Panel */}
              <div className="lg:col-span-1 space-y-6">
                {/* Summary Card */}
                <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-transparent">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-500" />
                      Your Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{insights.summary}</p>
                    {context && (
                      <div className="flex gap-2 mt-4">
                        <Badge variant="secondary">
                          Score: {context.latestScore as number}%
                        </Badge>
                        {(context.trend as number) !== 0 && (
                          <Badge
                            variant="secondary"
                            className={(context.trend as number) > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}
                          >
                            {(context.trend as number) > 0 ? "+" : ""}{context.trend as number}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Strength Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      Your Strength
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-1">{insights.strength.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {insights.strength.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Growth Area Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Target className="w-4 h-4 text-orange-500" />
                      Growth Area
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-2">{insights.growthArea.title}</h4>
                    <ul className="space-y-2">
                      {insights.growthArea.exercises.map((exercise, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-orange-600">{idx + 1}</span>
                          </div>
                          <span className="text-muted-foreground">{exercise}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Daily Tip */}
                <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/30">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Today&apos;s Tip</h4>
                        <p className="text-sm text-muted-foreground">{insights.dailyTip}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Panel */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Ask Your Coach
                    </CardTitle>
                    <CardDescription>
                      Get personalized advice on any EQ topic
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                      {messages.length === 0 ? (
                        <div className="text-center py-8">
                          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <p className="text-muted-foreground mb-4">
                            Ask me anything about emotional intelligence
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {suggestedQuestions.map((q, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => setInput(q)}
                                className="text-xs"
                              >
                                {q}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {sending && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <Spinner className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about improving your EQ..."
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={sending}
                      />
                      <Button onClick={sendMessage} disabled={sending || !input.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
