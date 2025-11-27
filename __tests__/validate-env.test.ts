/**
 * @jest-environment node
 */

describe("Environment Validation", () => {
  const originalEnv = process.env;
  let consoleSpy: {
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    // Set to production so module side effect doesn't throw on missing vars
    process.env.NODE_ENV = "production";

    // Set required env vars for tests
    process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    process.env.NOVITA_API_KEY = "test-key";

    // Suppress console output during tests
    consoleSpy = {
      error: jest.spyOn(console, "error").mockImplementation(),
      warn: jest.spyOn(console, "warn").mockImplementation(),
    };
  });

  afterEach(() => {
    consoleSpy.error.mockRestore();
    consoleSpy.warn.mockRestore();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("validateEnvironment", () => {
    it("returns valid when all required vars are set", async () => {
      const { validateEnvironment } = await import("@/lib/validate-env");

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it("returns invalid when required vars are missing", async () => {
      // Delete BEFORE import - module side effect won't throw in production mode
      delete process.env.DATABASE_URL;

      const { validateEnvironment } = await import("@/lib/validate-env");
      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.missing).toContain("DATABASE_URL");
    });

    it("includes warnings for missing optional vars", async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const { validateEnvironment } = await import("@/lib/validate-env");
      const result = validateEnvironment();

      expect(result.warnings).toContain("STRIPE_SECRET_KEY");
    });
  });

  describe("featureFlags", () => {
    it("hasStripe returns true when both Stripe vars are set", async () => {
      process.env.STRIPE_SECRET_KEY = "sk_test_xxx";
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_xxx";

      const { featureFlags } = await import("@/lib/validate-env");

      expect(featureFlags.hasStripe()).toBe(true);
    });

    it("hasStripe returns false when Stripe vars are missing", async () => {
      delete process.env.STRIPE_SECRET_KEY;
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      const { featureFlags } = await import("@/lib/validate-env");

      expect(featureFlags.hasStripe()).toBe(false);
    });

    it("hasRateLimit returns true when Redis vars are set", async () => {
      process.env.UPSTASH_REDIS_REST_URL = "https://redis.upstash.io";
      process.env.UPSTASH_REDIS_REST_TOKEN = "token";

      const { featureFlags } = await import("@/lib/validate-env");

      expect(featureFlags.hasRateLimit()).toBe(true);
    });

    it("hasAnthropic returns true when API key is set", async () => {
      process.env.ANTHROPIC_API_KEY = "sk-ant-xxx";

      const { featureFlags } = await import("@/lib/validate-env");

      expect(featureFlags.hasAnthropic()).toBe(true);
    });

    it("hasOpenAI returns true when API key is set", async () => {
      process.env.OPENAI_API_KEY = "sk-xxx";

      const { featureFlags } = await import("@/lib/validate-env");

      expect(featureFlags.hasOpenAI()).toBe(true);
    });

    it("hasEmbeddings returns true when service URL is set", async () => {
      process.env.EMBEDDING_SERVICE_URL = "http://localhost:8000";

      const { featureFlags } = await import("@/lib/validate-env");

      expect(featureFlags.hasEmbeddings()).toBe(true);
    });
  });
});
