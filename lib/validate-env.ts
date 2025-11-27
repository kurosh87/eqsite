/**
 * Environment variable validation
 * Validates required environment variables at application startup
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'BLOB_READ_WRITE_TOKEN',
  'NOVITA_API_KEY',
];

const optionalEnvVars = [
  'BETTER_AUTH_SECRET',
  'ANTHROPIC_API_KEY',
  'REPLICATE_API_TOKEN',
  'AI_GATEWAY_API_KEY',
  'NEXT_PUBLIC_MAPBOX_TOKEN',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_SUBSCRIPTION_PRICE_ID',
  'STRIPE_SUBSCRIPTION_COUPON_ID',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'VISION_LLM_API_URL',
  'VISION_LLM_PROVIDER',
  'OPENAI_API_KEY',
  'EMBEDDING_SERVICE_URL',
];

export function validateEnvironment(): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // Check optional but recommended variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(envVar);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validate at startup - call this in middleware or app initialization
 */
export function validateEnvOrThrow(): void {
  const result = validateEnvironment();

  if (!result.isValid) {
    const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 ENVIRONMENT CONFIGURATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Missing required environment variables:
${result.missing.map((v) => `  • ${v}`).join('\n')}

Please add these to your .env.local file or Vercel environment settings.

See DEPLOYMENT_GUIDE.md for more information.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    console.error(errorMessage);
    throw new Error('Missing required environment variables');
  }

  // Log warnings for optional variables
  if (result.warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  OPTIONAL ENVIRONMENT VARIABLES NOT SET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Some optional features may not work:
${result.warnings.map((v) => `  • ${v}`).join('\n')}

These are optional and can be added later as needed.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  }
}

/**
 * Check if specific optional features are available
 */
export const featureFlags = {
  hasStripe: () => !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  hasAnthropic: () => !!process.env.ANTHROPIC_API_KEY,
  hasReplicate: () => !!process.env.REPLICATE_API_TOKEN,
  hasRateLimit: () => !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
  hasMapbox: () => !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  hasNovita: () => !!process.env.NOVITA_API_KEY,
  hasOpenAI: () => !!process.env.OPENAI_API_KEY,
  hasEmbeddings: () => !!process.env.EMBEDDING_SERVICE_URL,
};

// Validate on module load in server-side contexts
if (typeof window === 'undefined') {
  try {
    validateEnvOrThrow();
  } catch (error) {
    // In production, log but don't crash
    if (process.env.NODE_ENV === 'production') {
      console.error('Environment validation failed:', error);
    } else {
      // In development, throw to alert developer
      throw error;
    }
  }
}
