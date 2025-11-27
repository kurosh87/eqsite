import { neon } from "@neondatabase/serverless";

const connection = neon(process.env.DATABASE_URL!);

export interface UserSubscription {
  id: string;
  userId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: "trialing" | "active" | "canceled" | "past_due" | "incomplete" | "none";
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get user's subscription status
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const result = await connection`
      SELECT
        id,
        user_id as "userId",
        stripe_customer_id as "stripeCustomerId",
        stripe_subscription_id as "stripeSubscriptionId",
        status,
        current_period_start as "currentPeriodStart",
        current_period_end as "currentPeriodEnd",
        cancel_at_period_end as "cancelAtPeriodEnd",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM subscriptions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    return (result[0] as UserSubscription) || null;
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return null;
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) return false;

  const activeStatuses = ["trialing", "active"];
  return activeStatuses.includes(subscription.status);
}

/**
 * Create or update subscription record
 */
export async function upsertSubscription(
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  status: string,
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date,
  cancelAtPeriodEnd: boolean = false
): Promise<string> {
  try {
    const result = await connection`
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        stripe_subscription_id,
        status,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${stripeCustomerId},
        ${stripeSubscriptionId},
        ${status},
        ${currentPeriodStart || null},
        ${currentPeriodEnd || null},
        ${cancelAtPeriodEnd},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_customer_id = ${stripeCustomerId},
        stripe_subscription_id = ${stripeSubscriptionId},
        status = ${status},
        current_period_start = ${currentPeriodStart || null},
        current_period_end = ${currentPeriodEnd || null},
        cancel_at_period_end = ${cancelAtPeriodEnd},
        updated_at = NOW()
      RETURNING id
    `;

    return result[0].id;
  } catch (error) {
    console.error("Error upserting subscription:", error);
    throw error;
  }
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: string,
  currentPeriodEnd?: Date,
  cancelAtPeriodEnd?: boolean
): Promise<void> {
  try {
    await connection`
      UPDATE subscriptions
      SET
        status = ${status},
        current_period_end = COALESCE(${currentPeriodEnd || null}, current_period_end),
        cancel_at_period_end = COALESCE(${cancelAtPeriodEnd ?? null}, cancel_at_period_end),
        updated_at = NOW()
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `;
  } catch (error) {
    console.error("Error updating subscription status:", error);
    throw error;
  }
}

/**
 * Get Stripe customer ID for a user, or null if they don't have one
 */
export async function getStripeCustomerId(userId: string): Promise<string | null> {
  try {
    const result = await connection`
      SELECT stripe_customer_id as "stripeCustomerId"
      FROM subscriptions
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    return result[0]?.stripeCustomerId || null;
  } catch (error) {
    console.error("Error fetching Stripe customer ID:", error);
    return null;
  }
}

/**
 * Save Stripe customer ID for a user
 */
export async function saveStripeCustomerId(
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  try {
    await connection`
      INSERT INTO subscriptions (
        user_id,
        stripe_customer_id,
        status,
        created_at,
        updated_at
      )
      VALUES (
        ${userId},
        ${stripeCustomerId},
        'none',
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_customer_id = ${stripeCustomerId},
        updated_at = NOW()
    `;
  } catch (error) {
    console.error("Error saving Stripe customer ID:", error);
    throw error;
  }
}
