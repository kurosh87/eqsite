"use client";

/* eslint-disable @next/next/no-img-element -- renders user-uploaded imagery from local storage */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnhancedResults } from "@/components/enhanced-results";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Sparkles } from "lucide-react";

interface LocalAnalysisPayload {
  uploadedImageUrl: string;
  matches: any[];
  aiReport: string;
  raw?: any;
  llmProvider?: string;
  createdAt?: string;
}

export default function LocalAnalysisPage() {
  const router = useRouter();
  const [data, setData] = useState<LocalAnalysisPayload | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("localAnalysisResult");
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (err) {
      console.warn("Failed to read local analysis result:", err);
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Card className="max-w-lg w-full p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">No analysis found</h1>
          <p className="text-sm text-muted-foreground">
            Start a new analysis to view the results here.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/")}>Start New Analysis</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Instant Analysis</div>
              <div className="text-lg font-semibold">Local Preview</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                New Upload
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-8">
          <EnhancedResults
            uploadedImageUrl={data.uploadedImageUrl}
            topMatches={
              (data.matches || []).map((m, idx) => ({
                phenotypeId: m.id || `local-${idx}`,
                phenotypeName: m.name || "Unknown",
                similarity: (m.confidence ?? m.similarity ?? 0) / (m.confidence ? 100 : 1),
                imageUrl: m.imageUrl || data.uploadedImageUrl,
                regions: m.region ? [m.region] : [],
                llmConfidence: typeof m.confidence === "number" ? m.confidence : undefined,
                llmReasoning: m.reason || "",
                llmProvider: data.llmProvider || "novita",
              })) as any
            }
            aiReport={data.aiReport || ""}
            createdAt={data.createdAt}
            visionSummary={
              data.llmProvider
                ? {
                    provider: data.llmProvider,
                    analysis: data.aiReport,
                    matches: (data.matches || []).map((m: any, idx: number) => ({
                      phenotype: m.name || `Match ${idx + 1}`,
                      confidence:
                        typeof m.confidence === "number"
                          ? m.confidence
                          : typeof m.similarity === "number"
                          ? m.similarity * 100
                          : 0,
                      reasoning: m.reason || "",
                      rank: idx + 1,
                    })),
                  }
                : undefined
            }
          />
        </div>
      </main>
    </div>
  );
}
