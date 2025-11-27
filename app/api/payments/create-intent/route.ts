import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { stripe, REPORT_PRICE_CENTS, CURRENCY, isStripeConfigured } from "@/lib/stripe";
import { getReportById, createPayment } from "@/lib/database";

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

    // Check if Stripe is configured
    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured. Please use the simulate payment option." },
        { status: 503 }
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

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: REPORT_PRICE_CENTS,
      currency: CURRENCY,
      metadata: {
        reportId: reportId,
        userId: user.id,
        userEmail: user.primaryEmail || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Create payment record in database
    await createPayment(
      user.id,
      reportId,
      REPORT_PRICE_CENTS,
      CURRENCY,
      paymentIntent.id
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      {
        error: "Failed to create payment intent. Please try again.",
        ...(process.env.NODE_ENV === 'development' && { details: error.message }),
      },
      { status: 500 }
    );
  }
}
