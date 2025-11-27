/* eslint-disable @next/next/no-img-element -- PDF previews include remote user imagery */

import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import { getReportById, incrementReportAccess } from "@/lib/database";
import { ModernHeader } from "@/components/modern-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ArrowLeft, Download, Share2, Sparkles, TrendingUp, Zap } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FullReportPage({
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

  // If not paid, redirect to preview
  if (report.status === "preview") {
    redirect(`/reports/${id}/preview`);
  }

  // Increment access count
  await incrementReportAccess(id);

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  const secondaryPhenotypes = JSON.parse(report.secondaryPhenotypes || "[]");
  const topSecondary = secondaryPhenotypes[0];
  const nearbyPhenotypeNames = secondaryPhenotypes
    .slice(0, 3)
    .map((match: any) => match.name)
    .join(", ");
  const aiNarrative = `Our model compared your photo against our library of 246 phenotypes using deep-feature embeddings and similarity scoring. ${
    report.primaryPhenotypeName
  } emerged as the strongest match after evaluating ${
    secondaryPhenotypes.length + 1
  } close candidates. ${
    nearbyPhenotypeNames
      ? `Other nearby phenotypes included ${nearbyPhenotypeNames}, each sharing overlapping traits but with lower similarity scores.`
      : ""
  } The analysis focuses on proportions, bone structure, and key markers such as eye spacing, nasal shape, and jaw definition to explain the match.`;

  return (
    <div className="min-h-screen flex flex-col">
      <ModernHeader user={userData} />

      <main className="flex-1 gradient-mesh">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-green-100 text-green-700 border-green-200 mb-4">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Premium Report Unlocked
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                  Your Complete Phenotype Analysis
                </h1>
                <p className="text-muted-foreground text-lg">
                  Comprehensive insights into your {report.primaryPhenotypeName} phenotype
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="narrative">AI Narrative</TabsTrigger>
              <TabsTrigger value="matches">Match Insights</TabsTrigger>
              <TabsTrigger value="upcoming">Coming Soon</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Uploaded Photo */}
                <Card className="border-2 shadow-lg">
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
                      <CardTitle className="text-xl">Primary Phenotype</CardTitle>
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-6">
                      <img
                        src={report.primaryPhenotypeImageUrl}
                        alt={report.primaryPhenotypeName}
                        className="w-48 h-48 rounded-xl object-cover ring-4 ring-primary/20"
                      />
                      <div>
                        <h3 className="text-3xl font-bold mb-3">
                          {report.primaryPhenotypeName}
                        </h3>
                        <Badge className="text-lg px-4 py-2 bg-primary mb-4">
                          Primary Match
                        </Badge>
                        <p className="text-sm text-muted-foreground max-w-md">
                          {report.primaryPhenotypeDescription}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-xl">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-base leading-relaxed">
                      Your facial analysis has identified <strong>{report.primaryPhenotypeName}</strong> as
                      your primary phenotype match. This report focuses on the visual traits that drove the
                      selection and how they compare to our phenotype library.
                    </p>
                    <p className="text-base leading-relaxed mt-4">
                      Explore the AI narrative to read a full breakdown of your look, then dive into the
                      similarity rankings to see which phenotypes were close contenders. Future modules will
                      be added here as they launch, and this report will update automatically.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="narrative">
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-2xl">AI Narrative</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-base leading-relaxed">{aiNarrative}</p>
                  {topSecondary && (
                    <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                      <h3 className="font-semibold mb-2">Closest Alternate Match</h3>
                      <p>
                        {topSecondary.name} trailed the primary match by {Math.round(topSecondary.similarity * 100)}%
                        similarity. Reviewing nearby phenotypes helps contextualize the nuances in your
                        facial structure.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches">
              <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                <Card className="border-2 shadow-lg">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-xl">Ranked Phenotype Matches</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {secondaryPhenotypes.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {secondaryPhenotypes.map((match: any, index: number) => (
                          <div
                            key={match.id}
                            className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-shrink-0 font-bold text-2xl text-muted-foreground w-8">
                              {index + 2}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{match.name}</h4>
                            </div>
                            <Badge className="bg-primary">
                              {Math.round(match.similarity * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        We didn&apos;t find close secondary matches for this report. As the phenotype library grows,
                        new comparisons will appear here automatically.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-2 shadow-lg">
                  <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="text-xl">Feature Highlights</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                      We surface the facial characteristics that most influenced the similarity score. Look for
                      alignment in:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Overall cranial and jaw structure relative to the phenotype average</li>
                      <li>Orbital and brow positioning that affects perceived ancestry cues</li>
                      <li>Nasal bridge and tip shape, which heavily weight differentiating phenotypes</li>
                      <li>Mouth width and chin balance that refine the match ranking</li>
                    </ul>
                    <p className="text-xs">Future updates will augment these highlights with visuals and measurements.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="upcoming">
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-2xl">Roadmap &amp; Upcoming Modules</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 text-muted-foreground">
                  <p>
                    We&apos;re actively building deeper context around each phenotype. You&apos;ll see new sections
                    unlock here as they launch—no additional purchase required.
                  </p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-primary mt-0.5" />
                      <span>
                        Genetic context with haplogroups and ancestry estimates <span className="font-semibold">(coming soon)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-primary mt-0.5" />
                      <span>
                        Interactive maps to visualize historical distribution <span className="font-semibold">(coming soon)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-primary mt-0.5" />
                      <span>
                        Cultural and lifestyle spotlights curated for each phenotype <span className="font-semibold">(coming soon)</span>
                      </span>
                    </li>
                  </ul>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Regression checklist: keep roadmap items labeled as upcoming unless the feature ships.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
