/**
 * Production-aware logger
 * Only outputs debug logs in development mode
 */

const isDev = process.env.NODE_ENV !== "production";

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log("[DEBUG]", ...args);
    }
  },
  info: (...args: unknown[]) => {
    console.log("[INFO]", ...args);
  },
  warn: (...args: unknown[]) => {
    console.warn("[WARN]", ...args);
  },
  error: (...args: unknown[]) => {
    console.error("[ERROR]", ...args);
  },
  // For important audit events that should always be logged
  audit: (...args: unknown[]) => {
    console.log("[AUDIT]", ...args);
  },
};
