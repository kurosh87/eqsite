/* eslint-disable @next/next/no-img-element -- preview renders remote phenotype media */

import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import { getReportById } from "@/lib/database";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Lock, Sparkles, TrendingUp, Zap } from "lucide-react";
import { REPORT_PRICE_CENTS } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const report = await getReportById(id, user.id);

  if (!report) {
    notFound();
  }

  // If already paid, redirect to full report
  if (report.status === "paid" || report.status === "complete") {
    redirect(`/reports/${id}`);
  }

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  const priceInDollars = (REPORT_PRICE_CENTS / 100).toFixed(2);
  const secondaryPhenotypesRaw = report.secondaryPhenotypes;
  const secondaryPhenotypes: Array<{ id: string; name: string; similarity: number }> = Array.isArray(secondaryPhenotypesRaw)
    ? secondaryPhenotypesRaw
    : typeof secondaryPhenotypesRaw === "string"
      ? (() => {
          try {
            return JSON.parse(secondaryPhenotypesRaw) || [];
          } catch {
            console.warn("[preview] Unable to parse secondaryPhenotypes JSON");
            return [];
          }
        })()
      : [];

  // Create preview text (truncated to ~200 words)
  const previewText = `Your facial analysis has identified ${report.primaryPhenotypeName} as your primary phenotype match. This
comprehensive write-up highlights the story your features tell and how they relate to our phenotype library.

Based on advanced AI image analysis and vector similarity matching against our database of 246 phenotypes, your features show strong alignment with characteristics typically associated with ${report.primaryPhenotypeName}. This phenotype is described as ${report.primaryPhenotypeDescription || "a distinctive cluster of traits in our dataset"}.

The full report includes an AI-generated narrative of your look, a deep dive on the top match, and a ranked list of additional phenotypes with similarity scores...`;
  return (
    <div className="min-h-screen flex flex-col">
      <ModernHeader user={userData} />

      <main className="flex-1 gradient-mesh">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 max-w-4xl mx-auto">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="text-center">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary mb-4">
                <Sparkles className="mr-2 h-4 w-4" />
                Analysis Complete
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                Your Phenotype Analysis
              </h1>
              <p className="text-muted-foreground text-lg">
                Preview your results - Unlock the full report for comprehensive insights
              </p>
            </div>
          </div>

          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
            {/* Left Column - Preview Content */}
            <div className="space-y-6">
              {/* Uploaded Photo */}
              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl">Your Photo</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <img
                    src={report.uploadImageUrl}
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
                  <div className="flex flex-col items-center text-center gap-6">
                    <img
                      src={report.primaryPhenotypeImageUrl}
                      alt={report.primaryPhenotypeName}
                      className="w-40 h-40 rounded-xl object-cover ring-4 ring-primary/20"
                    />
                    <div>
                      <h3 className="text-3xl font-bold mb-3">
                        {report.primaryPhenotypeName}
                      </h3>
                      <Badge className="text-lg px-4 py-2 bg-primary">
                        Top Match
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Upgrade CTA */}
            <div className="space-y-6">
              {/* Preview Text with Blur */}
              <Card className="border-2 shadow-lg relative overflow-hidden">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Analysis Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 relative">
                  <div className="space-y-4 text-sm leading-relaxed">
                    <p>{previewText}</p>
                  </div>

                  {/* Blur overlay */}
                  <div className="absolute inset-0 top-40 bg-gradient-to-b from-transparent via-background/80 to-background backdrop-blur-sm flex items-end justify-center pb-8">
                    <div className="text-center">
                      <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-lg font-semibold mb-2">Continue reading...</p>
                      <p className="text-sm text-muted-foreground">Unlock the full report</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Matches Preview */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl">Additional Matches</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {secondaryPhenotypes.slice(0, 3).map((match: any, index: number) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="font-medium">
                          {index + 2}. {match.name}
                        </span>
                        <Badge variant="outline">
                          {Math.round(match.similarity * 100)}%
                        </Badge>
                      </div>
                    ))}

                    <div className="relative p-3 bg-muted/30 rounded-lg blur-sm">
                      <div className="flex items-center justify-between opacity-50">
                        <span className="font-medium">5. More matches...</span>
                        <Badge variant="outline">??%</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Card */}
              <Card className="border-2 border-primary shadow-xl bg-gradient-to-br from-primary/10 via-background to-background">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    Unlock Your Full Report
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold mb-2">${priceInDollars}</p>
                    <p className="text-sm text-muted-foreground">One-time payment • Lifetime access</p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold mb-3">What&apos;s included:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>AI Narrative:</strong> A tailored story explaining why {report.primaryPhenotypeName} is
                          your best match
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Top Match Breakdown:</strong> High-resolution phenotype profile with key traits and
                          description
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Similarity Scores:</strong> Full ranked list of additional phenotypes for context and
                          exploration
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Feature Highlights:</strong> Callouts of the facial characteristics the model focused on
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          <strong>Coming soon:</strong> Genetic context, interactive maps, and cultural spotlights as each
                          module launches
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Regression checklist: keep benefits in sync with the unlocked content above and label future modules as "coming soon". */}

                  <Link href={`/reports/${id}/checkout`} className="block">
                    <Button size="lg" className="w-full h-14 text-lg">
                      <Lock className="mr-2 h-5 w-5" />
                      Unlock Full Report - ${priceInDollars}
                    </Button>
                  </Link>

                  <p className="text-xs text-center text-muted-foreground">
                    Secure payment • Instant access • 100% satisfaction guaranteed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
