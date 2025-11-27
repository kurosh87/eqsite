import Stripe from "stripe";

// Price constants
export const REPORT_PRICE_CENTS = 999; // $9.99
export const CURRENCY = "usd";

// Subscription pricing
export const SUBSCRIPTION_TRIAL_PRICE_CENTS = 100; // $1 trial
export const SUBSCRIPTION_MONTHLY_PRICE_CENTS = 1900; // $19/month
export const SUBSCRIPTION_TRIAL_DAYS = 0; // Immediate charge, then monthly

// Stripe instance (optional for testing mode)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  : null;

// Helper to check if Stripe is configured
export const isStripeConfigured = () => !!process.env.STRIPE_SECRET_KEY;

// Stripe Price IDs (set these in your Stripe Dashboard or via API)
// These should be configured in environment variables for production
export const STRIPE_PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID || "";
export const STRIPE_PRODUCT_ID = process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID || "";
