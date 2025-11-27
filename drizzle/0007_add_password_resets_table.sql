-- Migration: Add password_resets table for password recovery flows
-- Created: 2024-07-17
-- Purpose: Support Better Auth forgot/reset password endpoints

CREATE TABLE IF NOT EXISTS "password_resets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "tokenHash" text NOT NULL UNIQUE,
  "expiresAt" timestamp NOT NULL,
  "used" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "password_resets_userId_idx" ON "password_resets" ("userId");
CREATE INDEX IF NOT EXISTS "password_resets_expires_at_idx" ON "password_resets" ("expiresAt");
