import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { getReportById, createPayment, markReportAsPaid } from "@/lib/database";
import { REPORT_PRICE_CENTS, CURRENCY } from "@/lib/stripe";

/**
 * Simulate payment endpoint - FOR TESTING ONLY
 * This allows testing the full flow without requiring real Stripe setup
 */
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Verify report exists and belongs to user
    const report = await getReportById(reportId, user.id);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check if already paid
    if (report.status === "paid" || report.status === "complete") {
      return NextResponse.json(
        { error: "Report already paid for" },
        { status: 400 }
      );
    }

    // Create a simulated payment record
    const paymentId = await createPayment(
      user.id,
      reportId,
      REPORT_PRICE_CENTS,
      CURRENCY,
      `test_${Date.now()}` // Simulated Stripe payment intent ID
    );

    // Immediately mark as paid (simulate successful payment)
    await markReportAsPaid(reportId, paymentId, REPORT_PRICE_CENTS);

    return NextResponse.json({
      success: true,
      message: "Payment simulated successfully",
      reportId,
      paymentId,
    });
  } catch (error: any) {
    console.error("Error simulating payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to simulate payment" },
      { status: 500 }
    );
  }
}
