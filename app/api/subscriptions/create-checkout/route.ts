import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import {
  stripe,
  isStripeConfigured,
  SUBSCRIPTION_TRIAL_PRICE_CENTS,
  SUBSCRIPTION_MONTHLY_PRICE_CENTS,
} from "@/lib/stripe";
import { getStripeCustomerId, saveStripeCustomerId } from "@/lib/subscriptions";

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
    // Return to home page with subscription=success param
    const successUrl = returnUrl
      ? `${returnUrl}${returnUrl.includes('?') ? '&' : '?'}subscription=success`
      : `${baseUrl}?subscription=success`;
    const cancelUrl = returnUrl || `${baseUrl}?subscription=canceled`;

    // Get or create Stripe customer
    let customerId = await getStripeCustomerId(user.id);

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.primaryEmail || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      await saveStripeCustomerId(user.id, customerId);
    }

    // Create Stripe Checkout Session with subscription
    // $1 trial (7 days) then $19/month
    // We use a discounted first invoice approach
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Phenotype Analysis Pro",
              description: "7-day trial for $1, then $19/month",
            },
            unit_amount: SUBSCRIPTION_MONTHLY_PRICE_CENTS, // $19
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      // Apply $18 discount to first invoice = pay $1 for first month
      discounts: [
        {
          coupon: await getOrCreateTrialCoupon(),
        },
      ],
      subscription_data: {
        metadata: {
          userId: user.id,
        },
      },
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        type: "subscription",
      },
      // Note: can't use allow_promotion_codes with discounts
      billing_address_collection: "auto",
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error("Error creating checkout session:", {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack?.split('\n').slice(0, 5).join('\n'),
    });

    // Check for Stripe-specific errors
    const isStripeError = error.type?.startsWith('Stripe') || error.raw?.type;
    const errorMessage = isStripeError
      ? `Stripe error: ${error.message}`
      : "Failed to create checkout session";

    return NextResponse.json(
      {
        error: errorMessage,
        ...(process.env.NODE_ENV !== "production" && { details: error.message }),
      },
      { status: 500 }
    );
  }
}

// Get or create the $18 off first month coupon (so $19 - $18 = $1 trial)
async function getOrCreateTrialCoupon(): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");

  const couponId = "pheno-trial-18-off";

  try {
    // Try to retrieve existing coupon
    await stripe.coupons.retrieve(couponId);
    return couponId;
  } catch {
    // Coupon doesn't exist, create it
    await stripe.coupons.create({
      id: couponId,
      amount_off: 1800, // $18 off in cents
      currency: "usd",
      duration: "once", // Only applies to first invoice
      name: "$1 Trial - First Month Discount",
    });
    return couponId;
  }
}
