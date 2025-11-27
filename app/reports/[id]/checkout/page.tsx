import { notFound, redirect } from "next/navigation";
import { stackServerApp } from "@/app/stack";
import { getReportById } from "@/lib/database";
import { ModernHeader } from "@/components/modern-header";
import { CheckoutForm } from "@/components/checkout-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { REPORT_PRICE_CENTS } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckoutPage({
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

  // If already paid, redirect to the full report
  if (report.status === "paid" || report.status === "complete") {
    redirect(`/reports/${id}`);
  }

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
          <div className="mb-12 max-w-2xl mx-auto">
            <Link href={`/reports/${id}/preview`}>
              <Button variant="ghost" className="mb-6 hover:bg-primary/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Preview
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                Unlock Your Full Report
              </h1>
              <p className="text-muted-foreground text-lg">
                Get complete access to your comprehensive phenotype analysis
              </p>
            </div>
          </div>

          {/* Checkout Form */}
          <CheckoutForm
            reportId={id}
            reportTitle={report.primaryPhenotypeName || "Phenotype Analysis"}
            price={REPORT_PRICE_CENTS}
          />
        </div>
      </main>
    </div>
  );
}
