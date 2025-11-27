"use client";

/* eslint-disable @next/next/no-img-element -- renders user-uploaded imagery from local storage */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EnhancedResults } from "@/components/enhanced-results";
import { AlertCircle, Sparkles, TrendingUp } from "lucide-react";

interface LocalAnalysisPayload {
  uploadedImageUrl: string;
  matches: any[];
  aiReport: string;
  raw?: any;
  llmProvider?: string;
  createdAt?: string;
}

function deriveFromSource(source: any) {
  if (!source) return { report: null, matches: null };
  if (typeof source === "string") {
    try {
      const parsed = JSON.parse(source);
      if (parsed && typeof parsed === "object") {
        return { report: parsed.report || null, matches: parsed.matches || null };
      }
    } catch {
      // not JSON
    }
    return { report: null, matches: null };
  }
  if (typeof source === "object") {
    return { report: (source as any).report || null, matches: (source as any).matches || null };
  }
  return { report: null, matches: null };
}

function trimText(text: string, max = 220) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function LocalReportPreview() {
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

  const derivedFromAi = useMemo(() => deriveFromSource(data?.aiReport), [data?.aiReport]);
  const derivedFromRaw = useMemo(() => deriveFromSource(data?.raw), [data?.raw]);

  const sanitizedMatches = useMemo(() => {
    const items: any[] = [];
    if (data?.matches) {
      for (const m of data.matches) {
        if (m && typeof m === "object") {
          if (Array.isArray((m as any).matches)) {
            (m as any).matches.forEach((child: any) => items.push(child));
          } else {
            items.push(m);
          }
        } else if (typeof m === "string") {
          try {
            const parsed = JSON.parse(m);
            if (parsed?.matches && Array.isArray(parsed.matches)) {
              parsed.matches.forEach((child: any) => items.push(child));
            }
          } catch {
            // ignore
          }
        }
      }
    }

    const fromAiMatches = Array.isArray(derivedFromAi.matches) ? derivedFromAi.matches : [];
    const fromRawMatches = Array.isArray(derivedFromRaw.matches) ? derivedFromRaw.matches : [];

    const merged =
      items.length > 0
        ? items
        : fromAiMatches.length > 0
        ? fromAiMatches
        : fromRawMatches;

    return merged
      .filter((m: any) => m && (m.name || m.phenotypeName))
      .slice(0, 6);
  }, [data, derivedFromAi.matches, derivedFromRaw.matches]);

  const topMatch = useMemo(() => sanitizedMatches?.[0], [sanitizedMatches]);

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Card className="max-w-lg w-full p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold">No report data available</h1>
          <p className="text-sm text-muted-foreground">
            Upload a photo and run an analysis to view the preview here.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => router.push("/")}>Start New Analysis</Button>
          </div>
        </Card>
      </div>
    );
  }

  const primaryName = topMatch?.name || topMatch?.phenotypeName || "Top Match";
  const primaryConfidence =
    typeof topMatch?.confidence === "number"
      ? Math.round(topMatch.confidence)
      : topMatch?.similarity
      ? Math.round(topMatch.similarity * 100)
      : null;
  const cleanedReport =
    derivedFromAi.report ||
    derivedFromRaw.report ||
    (typeof data.aiReport === "string" ? data.aiReport : "No analysis text available.");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Analysis Preview</div>
              <div className="text-lg font-semibold">Local Report</div>
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

      <main className="flex-1 gradient-mesh">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Uploaded Photo */}
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl">Your Photo</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={data.uploadedImageUrl}
                    alt="Your photo"
                    className="w-full aspect-square object-cover"
                  />
                </CardContent>
              </Card>

              {/* Primary Match */}
              <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-background">
                <CardHeader className="border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Primary Match</CardTitle>
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-40 h-40 rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center text-muted-foreground">
                      <img
                        src={data.uploadedImageUrl}
                        alt="Primary match"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-3">{primaryName}</h3>
                      <Badge className="text-lg px-4 py-2 bg-primary">
                        {primaryConfidence !== null ? `${primaryConfidence}%` : "Match"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Full Analysis Text */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p className="whitespace-pre-wrap">{cleanedReport}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Matches Preview */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl">Matches</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {sanitizedMatches.slice(0, 6).map((match: any, index: number) => (
                      <div
                        key={`${match.name || "match"}-${index}`}
                        className="p-3 bg-muted/30 rounded-lg space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {index + 1}. {match.name || "Match"}
                          </span>
                          <Badge variant="outline">
                            {typeof match.confidence === "number"
                              ? `${Math.round(match.confidence)}%`
                              : match.similarity
                              ? `${Math.round(match.similarity * 100)}%`
                              : "—"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {trimText(match.reason || match.llmReasoning || "No rationale provided")}
                        </div>
                        {match.morphology && (
                          <div className="text-[11px] text-muted-foreground">
                            Morphology: {match.morphology}
                          </div>
                        )}
                        {match.region_background && (
                          <div className="text-[11px] text-muted-foreground">
                            Region: {match.region_background}
                          </div>
                        )}
                        {match.haplogroup_notes && (
                          <div className="text-[11px] text-muted-foreground">
                            Haplogroups: {match.haplogroup_notes}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {match.region && (
                            <Badge variant="secondary" className="text-[11px]">
                              {match.region}
                            </Badge>
                          )}
                          {Array.isArray(match.haplogroups) &&
                            match.haplogroups.slice(0, 3).map((hg: string) => (
                              <Badge
                                key={`${match.name || "match"}-${hg}`}
                                variant="outline"
                                className="text-[11px]"
                              >
                                {hg}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="my-10" />

          {/* Detailed view using EnhancedResults */}
          <EnhancedResults
            uploadedImageUrl={data.uploadedImageUrl}
            topMatches={
              sanitizedMatches.map((m, idx) => ({
                phenotypeId: m.id || `local-${idx}`,
                phenotypeName: m.name || m.phenotypeName || "Unknown",
                similarity:
                  (m.confidence ?? m.similarity ?? 0) /
                  (typeof m.confidence === "number" ? 100 : 1),
                imageUrl: m.imageUrl || data.uploadedImageUrl,
                regions: m.region ? [m.region] : [],
                llmGroups: [
                  ...(m.region ? [m.region] : []),
                  ...(Array.isArray(m.haplogroups) ? m.haplogroups : []),
                ],
                llmConfidence: typeof m.confidence === "number" ? m.confidence : undefined,
                llmReasoning: m.reason || "",
                llmProvider: data.llmProvider || "novita",
                morphology: m.morphology || null,
                region_background: m.region_background || null,
                haplogroup_notes: m.haplogroup_notes || null,
                haplogroups: Array.isArray(m.haplogroups) ? m.haplogroups : [],
              })) as any
            }
            aiReport={cleanedReport || ""}
            createdAt={data.createdAt}
            visionSummary={
              data.llmProvider
                ? {
                    provider: data.llmProvider,
                    analysis: cleanedReport,
                    matches: sanitizedMatches.map((m: any, idx: number) => ({
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
