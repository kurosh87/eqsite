import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { checkRateLimit, checkAIRateLimit, isRateLimitConfigured } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ||
             request.headers.get("x-real-ip") ||
             "test-ip";

  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    ip,
    configured: isRateLimitConfigured(),
    envCheck: {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "set" : "missing",
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "set" : "missing",
      urlPrefix: process.env.UPSTASH_REDIS_REST_URL?.substring(0, 30) + "...",
    },
  };

  // Test direct Redis connection
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Simple ping test
    const pingResult = await redis.ping();
    checks.directRedisTest = { success: true, ping: pingResult };

    // Test rate limiter directly
    const testRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, "1 h"),
      prefix: "@test/debug",
    });

    const directResult = await testRatelimit.limit(`debug:${ip}`);
    checks.directRateLimitTest = {
      success: directResult.success,
      remaining: directResult.remaining,
      limit: directResult.limit,
    };
  } catch (error: any) {
    checks.directRedisTest = {
      success: false,
      error: error.message,
      name: error.name,
      cause: error.cause?.message,
    };
  }

  // Test via our wrapper functions
  try {
    const generalLimit = await checkRateLimit(`test:${ip}`);
    checks.generalRateLimit = generalLimit;

    const aiLimit = await checkAIRateLimit(`test:${ip}`);
    checks.aiRateLimit = aiLimit;

    const uploadLimit = await checkRateLimit(`upload:${ip}`);
    checks.uploadRateLimit = uploadLimit;

    return NextResponse.json({
      ...checks,
      status: "ok",
    });
  } catch (error: any) {
    console.error("[RateLimitCheck] Error:", error);

    return NextResponse.json({
      ...checks,
      status: "error",
      error: {
        message: error.message,
        name: error.name,
      },
    }, { status: 500 });
  }
}
