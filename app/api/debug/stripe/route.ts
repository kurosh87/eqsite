import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    stripeConfigured: isStripeConfigured(),
    envCheck: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "set" : "missing",
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "set" : "missing",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? "set" : "missing",
    },
  };

  // Check if subscriptions table exists
  try {
    const connection = neon(process.env.DATABASE_URL!);
    const result = await connection`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'subscriptions'
      ) as exists
    `;
    checks.subscriptionsTableExists = result[0]?.exists ?? false;
  } catch (error: any) {
    checks.subscriptionsTableError = error.message;
  }

  // Test raw fetch to Stripe (bypass SDK)
  try {
    const response = await fetch("https://api.stripe.com/v1/customers?limit=1", {
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });
    const data = await response.json();
    checks.rawFetchTest = {
      success: response.ok,
      status: response.status,
      hasData: !!data.data,
    };
  } catch (error: any) {
    checks.rawFetchTest = {
      success: false,
      error: error.message,
      name: error.name,
    };
  }

  // Test Stripe SDK connection
  if (stripe) {
    try {
      await stripe.customers.list({ limit: 1 });
      checks.stripeSDKTest = { success: true };
    } catch (error: any) {
      checks.stripeSDKTest = {
        success: false,
        error: error.message,
        type: error.type,
        code: error.code,
      };
    }
  }

  return NextResponse.json({
    ...checks,
    status: checks.stripeConfigured && checks.subscriptionsTableExists ? "ok" : "error",
  });
}
