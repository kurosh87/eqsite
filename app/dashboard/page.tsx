import { redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import type { Metadata } from "next";
import {
  getUserStats,
  getUserAssessments,
  getUserBadges,
  getTodaysChallenge,
  hasCompletedTodaysChallenge,
  getEqDomains,
} from "@/lib/eq-database";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard - EQ Platform",
  description:
    "Track your emotional intelligence progress, view your EQ scores, badges, and continue improving.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch all dashboard data
  const [stats, assessments, userBadges, domains, todaysChallenge] = await Promise.all([
    getUserStats(user.id),
    getUserAssessments(user.id, 5),
    getUserBadges(user.id),
    getEqDomains(),
    getTodaysChallenge(),
  ]);

  // Check if today's challenge is completed
  const challengeCompleted = todaysChallenge
    ? await hasCompletedTodaysChallenge(user.id)
    : false;

  // Get the latest assessment with domain scores
  const latestAssessment = assessments[0];
  const latestDomainScores = latestAssessment?.assessment.domainScores as Record<string, number> | null;

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  return (
    <DashboardContent
      user={userData}
      stats={stats}
      assessments={assessments}
      userBadges={userBadges}
      domains={domains}
      latestDomainScores={latestDomainScores}
      todaysChallenge={todaysChallenge}
      challengeCompleted={challengeCompleted}
    />
  );
}
