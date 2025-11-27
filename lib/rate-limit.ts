import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client - only if Upstash credentials are available
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Create rate limiters for different endpoints
  ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per hour
    analytics: true,
    prefix: "@upstash/ratelimit",
  });
}

// Stricter limit for expensive AI operations
let aiRatelimit: Ratelimit | null = null;
if (redis) {
  aiRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 AI analyses per hour
    analytics: true,
    prefix: "@upstash/ratelimit/ai",
  });
}

/**
 * Check rate limit for general API endpoints
 * Returns { success: boolean, remaining: number, reset: number }
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimit) {
    // In production, rate limiting is REQUIRED
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: Rate limiting not configured in production!');
      return {
        success: false,
        remaining: 0,
        reset: Date.now() + 3600000, // 1 hour from now
        limit: 0,
      };
    }

    // Development only - allow with warning
    console.warn('⚠️  Rate limiting not configured - DEVELOPMENT MODE ONLY');
    return { success: true, remaining: 999, reset: 0, limit: 999 };
  }

  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

    return {
      success,
      remaining,
      reset,
      limit,
    };
  } catch (error) {
    console.error('[RateLimit] Redis error:', error);
    // On Redis failure, allow the request but log the error
    // This prevents Redis issues from blocking all traffic
    return { success: true, remaining: -1, reset: 0, limit: -1 };
  }
}

/**
 * Check rate limit for expensive AI operations (analyze endpoints)
 * More restrictive than general endpoints
 */
export async function checkAIRateLimit(identifier: string) {
  if (!aiRatelimit) {
    // In production, AI rate limiting is CRITICAL to prevent abuse
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: AI rate limiting not configured in production!');
      return {
        success: false,
        remaining: 0,
        reset: Date.now() + 3600000,
        limit: 0,
      };
    }

    // Development only - allow with warning
    console.warn('⚠️  AI rate limiting not configured - DEVELOPMENT MODE ONLY');
    return { success: true, remaining: 999, reset: 0, limit: 999 };
  }

  try {
    const { success, limit, reset, remaining } = await aiRatelimit.limit(identifier);

    return {
      success,
      remaining,
      reset,
      limit,
    };
  } catch (error) {
    console.error('[AIRateLimit] Redis error:', error);
    // On Redis failure for AI, still allow but with warning
    // Better to allow a few extra requests than block all users
    return { success: true, remaining: -1, reset: 0, limit: -1 };
  }
}

// Password reset rate limiter - 3 attempts per hour
export const passwordResetRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      analytics: true,
      prefix: "@upstash/ratelimit/password-reset",
    })
  : null;

/**
 * Helper to check if rate limiting is configured
 */
export function isRateLimitConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(remaining: number, reset: number) {
  const resetDate = new Date(reset);
  return {
    error: "Rate limit exceeded. Please try again later.",
    rateLimitInfo: {
      remaining: 0,
      resetAt: resetDate.toISOString(),
      resetIn: `${Math.ceil((reset - Date.now()) / 1000 / 60)} minutes`,
    },
  };
}
