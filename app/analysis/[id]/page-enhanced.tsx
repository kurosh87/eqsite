import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import { getAnalysisById } from "@/lib/database";
import { ModernHeader } from "@/components/modern-header";
import { EnhancedResults } from "@/components/enhanced-results";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Sparkles, Upload } from "lucide-react";

interface StoredMatch {
  phenotypeId: string;
  phenotypeName: string;
  similarity: number;
  imageUrl: string;
  regions?: string[];
  parentGroups?: string[];
  llmConfidence?: number | null;
  llmReasoning?: string | null;
  llmGroups?: string[];
  llmProvider?: string | null;
  llmAnalysis?: string | null;
  llmPrimaryRegion?: string | null;
  llmMatchRank?: number | null;
  llmCostEstimate?: number | null;
}

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const analysis = await getAnalysisById(id, user.id);

  if (!analysis) {
    notFound();
  }

  const topMatches: StoredMatch[] = JSON.parse(analysis.topMatches || "[]");

  const visionSummary = (() => {
    const firstWithSummary = topMatches.find(
      (match) => match.llmAnalysis || match.llmProvider || match.llmPrimaryRegion
    );

    if (!firstWithSummary) {
      return undefined;
    }

    const matches = topMatches
      .filter((match) => typeof match.llmConfidence === "number")
      .map((match) => ({
        phenotype: match.phenotypeName,
        confidence: match.llmConfidence as number,
        reasoning: match.llmReasoning ?? undefined,
        rank: match.llmMatchRank ?? undefined,
      }));

    return {
      analysis: firstWithSummary.llmAnalysis,
      provider: firstWithSummary.llmProvider,
      primaryRegion: firstWithSummary.llmPrimaryRegion,
      costEstimate: firstWithSummary.llmCostEstimate,
      matches,
    };
  })();

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ModernHeader user={userData} />

      <main className="flex-1 gradient-mesh">
        <div className="container mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="mb-12 animate-fade-in">
            <Link href="/dashboard">
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Analysis Results
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Completed on {new Date(analysis.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Results Component */}
          <div className="animate-slide-up">
            <EnhancedResults
              uploadedImageUrl={analysis.uploadImageUrl}
              topMatches={topMatches}
              aiReport={analysis.aiReport}
              createdAt={analysis.createdAt}
              visionSummary={visionSummary}
            />
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center animate-fade-in">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link href="/">
                <Button size="lg" className="w-full h-14">
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze Another Photo
                </Button>
              </Link>
              <Link href="/phenotypes">
                <Button variant="outline" size="lg" className="w-full h-14">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Explore All Phenotypes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
