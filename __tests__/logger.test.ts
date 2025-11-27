/**
 * @jest-environment node
 */

describe("Logger", () => {
  const originalEnv = process.env;
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };

    consoleSpy = {
      log: jest.spyOn(console, "log").mockImplementation(),
      warn: jest.spyOn(console, "warn").mockImplementation(),
      error: jest.spyOn(console, "error").mockImplementation(),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("in development mode", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("debug logs in development", async () => {
      const { logger } = await import("@/lib/logger");
      logger.debug("test message");

      expect(consoleSpy.log).toHaveBeenCalledWith("[DEBUG]", "test message");
    });

    it("info logs always", async () => {
      const { logger } = await import("@/lib/logger");
      logger.info("info message");

      expect(consoleSpy.log).toHaveBeenCalledWith("[INFO]", "info message");
    });

    it("warn logs always", async () => {
      const { logger } = await import("@/lib/logger");
      logger.warn("warn message");

      expect(consoleSpy.warn).toHaveBeenCalledWith("[WARN]", "warn message");
    });

    it("error logs always", async () => {
      const { logger } = await import("@/lib/logger");
      logger.error("error message");

      expect(consoleSpy.error).toHaveBeenCalledWith("[ERROR]", "error message");
    });

    it("audit logs always", async () => {
      const { logger } = await import("@/lib/logger");
      logger.audit("audit message");

      expect(consoleSpy.log).toHaveBeenCalledWith("[AUDIT]", "audit message");
    });
  });

  describe("in production mode", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("debug does not log in production", async () => {
      const { logger } = await import("@/lib/logger");
      logger.debug("test message");

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it("info still logs in production", async () => {
      const { logger } = await import("@/lib/logger");
      logger.info("info message");

      expect(consoleSpy.log).toHaveBeenCalledWith("[INFO]", "info message");
    });

    it("error still logs in production", async () => {
      const { logger } = await import("@/lib/logger");
      logger.error("error message");

      expect(consoleSpy.error).toHaveBeenCalledWith("[ERROR]", "error message");
    });

    it("audit still logs in production", async () => {
      const { logger } = await import("@/lib/logger");
      logger.audit("audit message");

      expect(consoleSpy.log).toHaveBeenCalledWith("[AUDIT]", "audit message");
    });
  });

  describe("with multiple arguments", () => {
    it("passes all arguments to console", async () => {
      process.env.NODE_ENV = "development";
      const { logger } = await import("@/lib/logger");

      logger.info("message", { key: "value" }, 123);

      expect(consoleSpy.log).toHaveBeenCalledWith("[INFO]", "message", { key: "value" }, 123);
    });
  });
});
