/**
 * @jest-environment node
 */

// Mock dependencies before importing the route
jest.mock("@/lib/database", () => ({
  checkDatabaseHealth: jest.fn(),
}));

jest.mock("@/lib/validate-env", () => ({
  validateEnvironment: jest.fn(),
  featureFlags: {
    hasRateLimit: jest.fn(),
    hasStripe: jest.fn(),
    hasAnthropic: jest.fn(),
  },
}));

jest.mock("@/lib/embeddings", () => ({
  checkEmbeddingServiceHealth: jest.fn(),
}));

jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(() => jest.fn().mockResolvedValue([{ count: "100" }])),
}));

import { GET } from "@/app/api/health/route";
import { checkDatabaseHealth } from "@/lib/database";
import { validateEnvironment, featureFlags } from "@/lib/validate-env";
import { checkEmbeddingServiceHealth } from "@/lib/embeddings";

describe("Health API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default healthy mocks
    (checkDatabaseHealth as jest.Mock).mockResolvedValue({
      healthy: true,
      latency: 5,
    });

    (validateEnvironment as jest.Mock).mockReturnValue({
      missing: [],
      optional: [],
    });

    (featureFlags.hasRateLimit as jest.Mock).mockReturnValue(true);
    (featureFlags.hasStripe as jest.Mock).mockReturnValue(true);
    (featureFlags.hasAnthropic as jest.Mock).mockReturnValue(true);

    (checkEmbeddingServiceHealth as jest.Mock).mockResolvedValue(true);
  });

  it("returns healthy status when all services are up", async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("healthy");
    expect(data.services.database).toBe("up");
    expect(data.services.phenotypes).toBe("loaded");
  });

  it("returns unhealthy when database is down", async () => {
    (checkDatabaseHealth as jest.Mock).mockResolvedValue({
      healthy: false,
      latency: null,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.services.database).toBe("down");
  });

  it("returns unhealthy when env vars are missing", async () => {
    (validateEnvironment as jest.Mock).mockReturnValue({
      missing: ["DATABASE_URL"],
      optional: [],
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.issues.missingEnvVars).toContain("DATABASE_URL");
  });

  it("includes feature flags in response", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.features).toBeDefined();
    expect(data.features.rateLimit).toBe("enabled");
    expect(data.features.payments).toBe("enabled");
  });

  it("handles exceptions gracefully", async () => {
    (checkDatabaseHealth as jest.Mock).mockRejectedValue(new Error("Connection failed"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("unhealthy");
    expect(data.error).toBe("Health check failed");
  });

  it("includes deployment metadata", async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.meta).toBeDefined();
    expect(data.meta.environment).toBeDefined();
  });
});
