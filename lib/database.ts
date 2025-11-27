import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "@/app/schema/schema";

// Lazy database connection - only initializes when first accessed
// This prevents build-time errors when DATABASE_URL isn't set
let _connection: NeonQueryFunction<false, false> | null = null;
let _db: NeonHttpDatabase<typeof schema> | null = null;

function getConnection(): NeonQueryFunction<false, false> {
  if (!_connection) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    _connection = neon(process.env.DATABASE_URL, {
      fetchOptions: {
        cache: 'no-store',
      },
    });
  }
  return _connection;
}

// Tagged template function that lazily gets connection
function connection(strings: TemplateStringsArray, ...values: unknown[]) {
  return getConnection()(strings, ...values);
}

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getConnection(), { schema });
  }
  return _db;
}

// Export db getter for backwards compatibility
export const db = {
  get query() {
    return getDb().query;
  },
  get select() {
    return getDb().select.bind(getDb());
  },
  get insert() {
    return getDb().insert.bind(getDb());
  },
  get update() {
    return getDb().update.bind(getDb());
  },
  get delete() {
    return getDb().delete.bind(getDb());
  },
  execute<T>(query: Parameters<NeonHttpDatabase<typeof schema>['execute']>[0]) {
    return getDb().execute(query) as unknown as Promise<T>;
  },
};

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    await connection`SELECT 1 as status`;
    const latency = Date.now() - startTime;
    return { healthy: true, latency };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Database health check failed:", error);
    return { healthy: false, error: message };
  }
}

// Legacy stubs for phenotype code - will be removed
export async function getUserAnalysisHistory(userId: string, limit = 20) {
  void userId;
  void limit;
  return [];
}

export async function getReportById(reportId: string, userId: string) {
  void reportId;
  void userId;
  return null;
}

export async function createPayment(
  userId: string,
  reportId: string,
  amount: number,
  currency = "usd",
  stripePaymentIntentId?: string
) {
  void userId;
  void reportId;
  void amount;
  void currency;
  void stripePaymentIntentId;
  return null;
}

export async function markReportAsPaid(
  reportId: string,
  paymentId: string,
  amountPaid: number
) {
  void reportId;
  void paymentId;
  void amountPaid;
}

export async function getPaymentByStripeId(stripePaymentIntentId: string) {
  void stripePaymentIntentId;
  return null;
}

export async function updatePaymentStatus(
  paymentId: string,
  status: string,
  stripePaymentIntentId?: string
) {
  void paymentId;
  void status;
  void stripePaymentIntentId;
}
