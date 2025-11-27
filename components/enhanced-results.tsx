"use client";

/* eslint-disable @next/next/no-img-element -- analysis cards render arbitrary remote thumbnails */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, MapPin, Sparkles } from "lucide-react";

interface Match {
  phenotypeId: string;
  phenotypeName: string;
  similarity: number;
  imageUrl: string;
  regions?: string[];
  parentGroups?: string[];
  embeddingSimilarity?: number | null;
  measurementSimilarity?: number | null;
  hybridScore?: number | null;
  adjustedSimilarity?: number | null;
  confidence?: string | null;
  llmConfidence?: number | null;
  llmReasoning?: string | null;
  llmGroups?: string[];
  llmProvider?: string | null;
  llmAnalysis?: string | null;
  llmPrimaryRegion?: string | null;
  llmMatchRank?: number | null;
  llmCostEstimate?: number | null;
  morphology?: string | null;
  region_background?: string | null;
  haplogroup_notes?: string | null;
  haplogroups?: string[] | null;
}

interface VisionSummary {
  analysis?: string | null;
  provider?: string | null;
  primaryRegion?: string | null;
  costEstimate?: number | null;
  matches?: Array<{
    phenotype: string;
    confidence: number;
    reasoning?: string;
    rank?: number;
  }>;
}

interface EnhancedResultsProps {
  uploadedImageUrl: string;
  topMatches: Match[];
  aiReport: string;
  createdAt?: string;
  visionSummary?: VisionSummary;
}

export function EnhancedResults({
  uploadedImageUrl,
  topMatches,
  aiReport,
  createdAt,
  visionSummary,
}: EnhancedResultsProps) {
  const topMatch = topMatches[0];
  const avgSimilarity =
    topMatches.reduce((sum, m) => sum + m.similarity, 0) / topMatches.length;

  const derivedVisionSummary: VisionSummary | undefined = visionSummary
    ? {
        ...visionSummary,
        matches: visionSummary.matches ||
          topMatches
            .filter((m) => typeof m.llmConfidence === "number")
            .map((m) => ({
              phenotype: m.phenotypeName,
              confidence: m.llmConfidence as number,
              reasoning: m.llmReasoning ?? undefined,
              rank: m.llmMatchRank ?? undefined,
            })),
      }
    : (() => {
        const withLLM = topMatches.some((m) => m.llmConfidence || m.llmAnalysis);
        if (!withLLM) return undefined;

        const matches = topMatches
          .filter((m) => typeof m.llmConfidence === "number")
          .map((m) => ({
            phenotype: m.phenotypeName,
            confidence: m.llmConfidence as number,
            reasoning: m.llmReasoning ?? undefined,
            rank: m.llmMatchRank ?? undefined,
          }));

        const firstWithSummary = topMatches.find(
          (m) => m.llmAnalysis || m.llmProvider || m.llmPrimaryRegion
        );

        return {
          analysis: firstWithSummary?.llmAnalysis ?? null,
          provider: firstWithSummary?.llmProvider ?? null,
          primaryRegion: firstWithSummary?.llmPrimaryRegion ?? null,
          costEstimate: firstWithSummary?.llmCostEstimate ?? null,
          matches,
        };
      })();

  const llmTopConfidence = derivedVisionSummary?.matches?.[0]?.confidence;
  const hasLLM = derivedVisionSummary?.matches && derivedVisionSummary.matches.length > 0;

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Best Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(topMatch.similarity * 100)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {topMatch.phenotypeName}
              {typeof topMatch.llmConfidence === "number" && (
                <span className="ml-2 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  LLM {Math.round(topMatch.llmConfidence)}%
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
          <CardTitle className="text-sm text-muted-foreground">
            Avg. Confidence ({hasLLM ? "LLM" : "Vector"})
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hasLLM && llmTopConfidence
                ? Math.round(
                    (derivedVisionSummary!.matches!.reduce((sum, m) => sum + (m.confidence || 0), 0) /
                      derivedVisionSummary!.matches!.length)
                  )
                : Math.round(avgSimilarity * 100)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Across top {topMatches.length} matches</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topMatches.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Phenotypes analyzed</p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Vision Model Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {typeof llmTopConfidence === "number"
                ? `${Math.round(llmTopConfidence)}%`
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {derivedVisionSummary?.provider
                ? `${derivedVisionSummary.provider?.toUpperCase()} verdict`
                : "LLM verdict pending"}
            </p>
          </CardContent>
        </Card>
      </div>

      {derivedVisionSummary && (
        <Card className="border-2 bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Vision Model Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap gap-4 text-xs uppercase tracking-wide text-muted-foreground/80">
              {derivedVisionSummary.provider && (
                <span>
                  Provider: <span className="font-semibold normal-case">{derivedVisionSummary.provider}</span>
                </span>
              )}
              {derivedVisionSummary.primaryRegion && (
                <span>
                  Primary Region: <span className="font-semibold normal-case">{derivedVisionSummary.primaryRegion}</span>
                </span>
              )}
              {typeof derivedVisionSummary.costEstimate === "number" && (
                <span>
                  Est. Cost: <span className="font-semibold normal-case">${derivedVisionSummary.costEstimate.toFixed(2)}</span>
                </span>
              )}
            </div>

            {derivedVisionSummary.matches && derivedVisionSummary.matches.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium text-foreground">Top LLM Matches:</p>
                <div className="flex flex-wrap gap-2">
                  {derivedVisionSummary.matches.slice(0, 3).map((match, index) => (
                    <Badge key={`${match.phenotype}-${index}`} variant="outline" className="bg-background/80">
                      {match.phenotype} · {Math.round(match.confidence)}%
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">
            <TrendingUp className="w-4 h-4 mr-2" />
            Comparison
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Analysis
          </TabsTrigger>
          <TabsTrigger value="all-matches">
            <MapPin className="w-4 h-4 mr-2" />
            All Matches
          </TabsTrigger>
        </TabsList>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Your Photo */}
            <Card className="border-2 shadow-lg">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle>Your Photo</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={uploadedImageUrl}
                    alt="Your uploaded photo"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white text-sm">
                      {createdAt
                        ? `Analyzed on ${new Date(createdAt).toLocaleDateString()}`
                        : "Uploaded just now"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Match */}
            <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-background">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle>Best Match</CardTitle>
                  <Badge className="bg-primary text-lg px-4 py-1">
                    {Math.round(topMatch.similarity * 100)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={topMatch.imageUrl}
                    alt={topMatch.phenotypeName}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 flex items-end p-6">
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-2">{topMatch.phenotypeName}</h3>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={topMatch.similarity * 100}
                          className="h-2 flex-1 bg-white/20"
                        />
                        <span className="text-sm font-medium">
                          {Math.round(topMatch.similarity * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Match Confidence Breakdown */}
          <Card className="mt-6 border-2">
            <CardHeader>
              <CardTitle>Match Confidence Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMatches.slice(0, 5).map((match, index) => (
                  <div key={match.phenotypeId} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium">{match.phenotypeName}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {Math.round(match.similarity * 100)}%
                      </span>
                    </div>
                    <Progress
                      value={match.similarity * 100}
                      className="h-3"
                    />
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {typeof match.llmConfidence === "number" && (
                        <Badge variant="secondary" className="text-[0.7rem]">
                          Vision model: {Math.round(match.llmConfidence)}%
                          {match.llmMatchRank ? ` · Rank #${match.llmMatchRank}` : ""}
                        </Badge>
                      )}
                      {typeof match.hybridScore === "number" && (
                        <span>
                          Hybrid score: {Math.round(match.hybridScore * 100)}%
                        </span>
                      )}
                      {match.llmGroups && match.llmGroups.length > 0 && (
                        <span className="flex flex-wrap gap-2">
                          {match.llmGroups.slice(0, 2).map((group) => (
                            <Badge key={group} variant="outline" className="text-[0.65rem]">
                              {group}
                            </Badge>
                          ))}
                          {match.llmGroups.length > 2 && <span>+{match.llmGroups.length - 2} more</span>}
                        </span>
                      )}
                      {match.morphology && (
                        <span className="italic text-[0.7rem]">
                          {match.morphology}
                        </span>
                      )}
                      {match.haplogroups && match.haplogroups.length > 0 && (
                        <span className="flex flex-wrap gap-1">
                          {match.haplogroups.slice(0, 3).map((hg) => (
                            <Badge key={`${match.phenotypeId}-${hg}`} variant="outline" className="text-[0.6rem]">
                              {hg}
                            </Badge>
                          ))}
                          {match.haplogroups.length > 3 && <span>+{match.haplogroups.length - 3}</span>}
                        </span>
                      )}
                      {match.region_background && (
                        <span className="text-[0.7rem] text-muted-foreground/80">
                          {match.region_background}
                        </span>
                      )}
                      {match.haplogroup_notes && (
                        <span className="text-[0.7rem] text-muted-foreground/80">
                          {match.haplogroup_notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="analysis" className="mt-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-Generated Analysis Report
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {aiReport}
                </div>
              </div>

              {derivedVisionSummary?.analysis && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" /> Vision Model Verdict
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {derivedVisionSummary.analysis}
                    </div>
                  </div>
                </>
              )}

              <Separator className="my-6" />

              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-semibold mb-2">About this analysis:</p>
                <p>
                  This report was generated using advanced AI analysis of your facial features
                  compared against our database of 246 anthropological phenotypes. The analysis is
                  for educational purposes and uses computer vision and vector similarity matching.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Matches Tab */}
        <TabsContent value="all-matches" className="mt-6">
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle>All {topMatches.length} Matches</CardTitle>
                <Badge variant="outline">{topMatches.length} results</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {topMatches.map((match, index) => (
                  <div key={match.phenotypeId}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex items-start gap-4 group cursor-pointer hover:bg-muted/20 -m-4 p-4 rounded-lg transition-colors">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute -left-2 -top-2 h-7 w-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center z-10">
                          {index + 1}
                        </div>
                        <img
                          src={match.imageUrl}
                          alt={match.phenotypeName}
                          className="w-24 h-24 rounded-xl object-cover ring-2 ring-border group-hover:ring-primary transition-all"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-lg">{match.phenotypeName}</h4>
                          <Badge className="ml-2 bg-primary text-base px-3 py-1">
                            {Math.round(match.similarity * 100)}%
                          </Badge>
                        </div>
                        <Progress
                          value={match.similarity * 100}
                          className="h-3"
                        />
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {typeof match.llmConfidence === "number" && (
                            <Badge variant="secondary" className="text-[0.65rem]">
                              Vision model {Math.round(match.llmConfidence)}%
                            </Badge>
                          )}
                          {match.llmReasoning && (
                            <span className="italic max-w-xl">
                              “{match.llmReasoning}”
                            </span>
                          )}
                          {match.llmGroups && match.llmGroups.length > 0 && (
                            <span className="flex flex-wrap gap-1">
                              {match.llmGroups.slice(0, 4).map((group) => (
                                <Badge key={`${match.phenotypeId}-${group}`} variant="outline" className="text-[0.6rem]">
                                  {group}
                                </Badge>
                              ))}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
