-- Requires pgcrypto for gen_random_uuid support

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "password_resets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expiresAt" timestamp with time zone NOT NULL,
  "used" boolean DEFAULT FALSE NOT NULL,
  "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "password_resets_user_id_idx" ON "password_resets" ("userId");
CREATE INDEX IF NOT EXISTS "password_resets_expires_at_idx" ON "password_resets" ("expiresAt" DESC);
