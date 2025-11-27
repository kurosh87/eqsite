-- Migration: Add webhook_events table for idempotency protection
-- Created: 2025-10-24
-- Purpose: Prevent duplicate webhook processing (Stripe payment webhooks)

CREATE TABLE IF NOT EXISTS "webhook_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "event_id" text NOT NULL UNIQUE,
  "event_type" text NOT NULL,
  "processed" boolean DEFAULT false NOT NULL,
  "processed_at" timestamp,
  "received_at" timestamp DEFAULT now() NOT NULL,
  "payload" jsonb,
  "error_message" text,
  "retry_count" integer DEFAULT 0 NOT NULL
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS "webhook_events_event_id_idx" ON "webhook_events" ("event_id");
CREATE INDEX IF NOT EXISTS "webhook_events_processed_idx" ON "webhook_events" ("processed");
CREATE INDEX IF NOT EXISTS "webhook_events_received_at_idx" ON "webhook_events" ("received_at" DESC);

-- Add cleanup policy comment
COMMENT ON TABLE "webhook_events" IS 'Stores webhook events to prevent duplicate processing. Old events (>30 days) should be archived periodically.';
