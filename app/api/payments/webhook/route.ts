import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  getPaymentByStripeId,
  updatePaymentStatus,
  markReportAsPaid,
} from "@/lib/database";
import { upsertSubscription, updateSubscriptionStatus } from "@/lib/subscriptions";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const connection = neon(process.env.DATABASE_URL!);

/**
 * Check if webhook event has already been processed (idempotency)
 */
async function hasBeenProcessed(eventId: string): Promise<boolean> {
  const result = await connection`
    SELECT processed FROM webhook_events WHERE event_id = ${eventId}
  `;
  return result.length > 0 && result[0].processed === true;
}

/**
 * Record webhook event receipt
 */
async function recordWebhookEvent(event: Stripe.Event): Promise<void> {
  await connection`
    INSERT INTO webhook_events (event_id, event_type, payload, received_at)
    VALUES (
      ${event.id},
      ${event.type},
      ${JSON.stringify(event)}::jsonb,
      NOW()
    )
    ON CONFLICT (event_id) DO NOTHING
  `;
}

/**
 * Mark webhook as successfully processed
 */
async function markWebhookProcessed(eventId: string): Promise<void> {
  await connection`
    UPDATE webhook_events
    SET processed = true, processed_at = NOW()
    WHERE event_id = ${eventId}
  `;
}

/**
 * Mark webhook as failed with error
 */
async function markWebhookFailed(eventId: string, errorMessage: string): Promise<void> {
  await connection`
    UPDATE webhook_events
    SET
      error_message = ${errorMessage},
      retry_count = COALESCE(retry_count, 0) + 1
    WHERE event_id = ${eventId}
  `;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // IDEMPOTENCY CHECK: Has this event already been processed?
    const alreadyProcessed = await hasBeenProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`Webhook ${event.id} already processed, skipping`);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    // Record webhook receipt
    await recordWebhookEvent(event);

    // Handle the event
    try {
      switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("Payment succeeded:", paymentIntent.id);

        // Get payment from database
        const payment = await getPaymentByStripeId(paymentIntent.id);

        if (!payment) {
          console.error("Payment not found for:", paymentIntent.id);
          return NextResponse.json(
            { error: "Payment not found" },
            { status: 404 }
          );
        }

        // Update payment status
        await updatePaymentStatus(payment.id, "succeeded", paymentIntent.id);

        // Mark report as paid
        await markReportAsPaid(
          payment.reportId,
          payment.id,
          paymentIntent.amount
        );

        console.log("Report unlocked:", payment.reportId);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("Payment failed:", paymentIntent.id);

        const payment = await getPaymentByStripeId(paymentIntent.id);

        if (payment) {
          await updatePaymentStatus(payment.id, "failed", paymentIntent.id);
        }

        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        console.log("Payment canceled:", paymentIntent.id);

        const payment = await getPaymentByStripeId(paymentIntent.id);

        if (payment) {
          await updatePaymentStatus(payment.id, "canceled", paymentIntent.id);
        }

        break;
      }

      // Subscription events
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (!userId) {
          console.error("No userId in subscription metadata:", subscription.id);
          break;
        }

        console.log(`Subscription ${event.type}:`, subscription.id, "Status:", subscription.status);

        // Access period dates with type assertion for older Stripe types
        const sub = subscription as Stripe.Subscription & { current_period_start?: number; current_period_end?: number };
        await upsertSubscription(
          userId,
          subscription.customer as string,
          subscription.id,
          subscription.status,
          new Date((sub.current_period_start || Date.now() / 1000) * 1000),
          new Date((sub.current_period_end || Date.now() / 1000) * 1000),
          subscription.cancel_at_period_end ?? false
        );

        console.log("Subscription saved for user:", userId);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const deletedSub = subscription as Stripe.Subscription & { current_period_end?: number };

        console.log("Subscription deleted:", subscription.id);

        await updateSubscriptionStatus(
          subscription.id,
          "canceled",
          new Date((deletedSub.current_period_end || Date.now() / 1000) * 1000),
          false
        );

        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("Checkout session completed:", session.id);

        // If this is a subscription checkout, the subscription events will handle it
        if (session.mode === "subscription" && session.subscription) {
          console.log("Subscription checkout completed, subscription ID:", session.subscription);
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };

        console.log("Invoice paid:", invoice.id);

        // Update subscription status if applicable
        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

        if (subscriptionId) {
          await updateSubscriptionStatus(subscriptionId, "active");
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription };

        console.log("Invoice payment failed:", invoice.id);

        const subscriptionId = typeof invoice.subscription === "string"
          ? invoice.subscription
          : invoice.subscription?.id;

        if (subscriptionId) {
          await updateSubscriptionStatus(subscriptionId, "past_due");
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

      // Mark webhook as successfully processed
      await markWebhookProcessed(event.id);
      console.log(`Webhook ${event.id} processed successfully`);

      return NextResponse.json({ received: true, status: 'processed' });
    } catch (processingError: any) {
      // Mark webhook as failed
      console.error(`Webhook processing error for ${event.id}:`, processingError);
      await markWebhookFailed(event.id, processingError.message);

      // Return 200 to Stripe to prevent retries (we've recorded the failure)
      return NextResponse.json({
        received: true,
        status: 'failed',
        error: processingError.message,
      });
    }
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}
