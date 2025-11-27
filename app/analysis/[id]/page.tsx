import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import { getAnalysisById, getReportByAnalysisId } from "@/lib/database";
import { AnalysisContent } from "@/components/analysis-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  // Check if there's a corresponding report and redirect to preview
  const relatedReport = await getReportByAnalysisId(analysis.id, user.id);

  if (relatedReport) {
    redirect(`/reports/${relatedReport.id}/preview`);
  }

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  const analysisData = {
    id: analysis.id,
    createdAt: analysis.createdAt,
    uploadImageUrl: analysis.uploadImageUrl,
    topMatches: analysis.topMatches || "[]",
    aiReport: analysis.aiReport || "",
  };

  return <AnalysisContent user={userData} analysis={analysisData} />;
}
