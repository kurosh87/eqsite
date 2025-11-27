import { neon } from "@neondatabase/serverless";

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  console.log("Running subscriptions table migration...\n");

  try {
    // Create subscriptions table
    console.log("Creating subscriptions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL UNIQUE,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        status TEXT NOT NULL DEFAULT 'none',
        current_period_start TIMESTAMPTZ,
        current_period_end TIMESTAMPTZ,
        cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("Table created!");

    // Create indexes
    console.log("Creating indexes...");
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status)`;
    console.log("Indexes created!");

    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
