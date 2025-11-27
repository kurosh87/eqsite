import { NextResponse } from "next/server";
import { checkDatabaseHealth, rawQuery as connection } from "@/lib/database";
import { validateEnvironment, featureFlags } from "@/lib/validate-env";
import { checkEmbeddingServiceHealth } from "@/lib/embeddings";
const deploymentMeta = {
  gitCommit: process.env.VERCEL_GIT_COMMIT_SHA || "local-dev",
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "local-dev",
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
};

export async function GET() {
  try {
    // Check database connection with new health check
    const dbHealth = await checkDatabaseHealth();
    const dbHealthy = dbHealth.healthy;

    // Check phenotype count
    const phenotypeCount = await connection`SELECT COUNT(*) as count FROM phenotypes`;
    const hasPhenotypes = parseInt(phenotypeCount[0].count) > 0;

    // Check environment variables using validation utility
    const envValidation = validateEnvironment();
    const missingEnvVars = envValidation.missing;

    // Check optional feature availability
    const features = {
      rateLimit: featureFlags.hasRateLimit(),
      stripe: featureFlags.hasStripe(),
      anthropic: featureFlags.hasAnthropic(),
    };

    // Check embedding service health (only if EMBEDDING_SERVICE_URL is set)
    let embeddingHealthy = true;
    if (process.env.EMBEDDING_SERVICE_URL) {
      embeddingHealthy = await checkEmbeddingServiceHealth();
    }

    const coreHealthy = dbHealthy && hasPhenotypes && missingEnvVars.length === 0;
    const optionalHealthy = embeddingHealthy;
    const degraded = coreHealthy && !optionalHealthy;

    if (!coreHealthy) {
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealthy ? 'up' : 'down',
            phenotypes: hasPhenotypes ? 'loaded' : 'empty',
            environment: missingEnvVars.length === 0 ? 'configured' : 'missing_vars',
            embedding: embeddingHealthy ? 'up' : 'down',
          },
          meta: deploymentMeta,
          issues: {
            ...(missingEnvVars.length > 0 && {
              missingEnvVars: missingEnvVars,
            }),
          },
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: degraded ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        phenotypes: 'loaded',
        storage: 'up',
        authentication: 'up',
        embedding: embeddingHealthy ? 'up' : 'unknown',
      },
      stats: {
        phenotypeCount: parseInt(phenotypeCount[0].count),
        databaseLatency: dbHealth.latency,
      },
      meta: deploymentMeta,
      features: {
        rateLimit: features.rateLimit ? 'enabled' : 'disabled',
        premiumReports: features.anthropic ? 'enabled' : 'disabled',
        payments: features.stripe ? 'enabled' : 'disabled',
      },
    });
  } catch (error: any) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        meta: deploymentMeta,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
        }),
      },
      { status: 503 }
    );
  }
}
