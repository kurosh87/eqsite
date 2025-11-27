import { redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import type { Metadata } from "next";
import { getUserAnalysisHistory } from "@/lib/database";
import { DashboardContent } from "@/components/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your phenotype analysis history, track your ancestry discoveries, and manage your account.",
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

  const history = await getUserAnalysisHistory(user.id, 20);

  const thisMonthCount = history.filter((h: any) => {
    const date = new Date(h.createdAt);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const userData = {
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    isAdmin: user.isAdmin,
  };

  return (
    <DashboardContent
      user={userData}
      history={history}
      thisMonthCount={thisMonthCount}
    />
  );
}
