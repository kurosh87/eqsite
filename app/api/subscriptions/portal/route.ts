import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getStripeCustomerId } from "@/lib/subscriptions";

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isStripeConfigured() || !stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { returnUrl } = body;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const defaultReturnUrl = returnUrl || `${baseUrl}/profile`;

    // Get Stripe customer ID
    const customerId = await getStripeCustomerId(user.id);

    if (!customerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 404 }
      );
    }

    // Create Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: defaultReturnUrl,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Error creating portal session:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create portal session",
        ...(process.env.NODE_ENV === "development" && { details: message }),
      },
      { status: 500 }
    );
  }
}
