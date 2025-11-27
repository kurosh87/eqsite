import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/app/stack";
import {
  getUserSubscription,
  hasActiveSubscription,
  getStripeCustomerId,
  upsertSubscription,
} from "@/lib/subscriptions";
import { stripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check URL param for sync request (after returning from Stripe checkout)
    const url = new URL(request.url);
    const shouldSync = url.searchParams.get("sync") === "true";

    // First check our database
    let subscription = await getUserSubscription(user.id);
    let isActive = await hasActiveSubscription(user.id);

    // If no active subscription in DB, check Stripe directly (fallback for testing without webhooks)
    if ((!isActive || shouldSync) && isStripeConfigured() && stripe) {
      const stripeCustomerId = await getStripeCustomerId(user.id);

      if (stripeCustomerId) {
        try {
          const stripeSubscriptions = await stripe.subscriptions.list({
            customer: stripeCustomerId,
            status: "all",
            limit: 1,
          });

          if (stripeSubscriptions.data.length > 0) {
            const stripeSub = stripeSubscriptions.data[0];
            const activeStatuses = ["trialing", "active"];

            // Sync to our database
            if (activeStatuses.includes(stripeSub.status)) {
              const sub = stripeSub as any; // Type assertion for period dates
              await upsertSubscription(
                user.id,
                stripeCustomerId,
                stripeSub.id,
                stripeSub.status,
                new Date((sub.current_period_start || Date.now() / 1000) * 1000),
                new Date((sub.current_period_end || Date.now() / 1000) * 1000),
                stripeSub.cancel_at_period_end
              );

              // Refresh from DB
              subscription = await getUserSubscription(user.id);
              isActive = true;
            }
          }
        } catch (stripeError) {
          console.error("Error checking Stripe subscriptions:", stripeError);
          // Continue with database-only response
        }
      }
    }

    return NextResponse.json({
      hasSubscription: isActive,
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}
