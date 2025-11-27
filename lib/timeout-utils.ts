/**
 * Timeout utilities for API calls and database queries
 * Prevents hanging requests that could exhaust resources
 */

export class TimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with a timeout
 * Rejects with TimeoutError if the promise doesn't resolve in time
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'unknown operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new TimeoutError(operationName, timeoutMs)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Standard timeouts for different operation types
 */
export const TIMEOUTS = {
  DATABASE_QUERY: 10000,      // 10 seconds
  AI_API_CALL: 30000,         // 30 seconds
  FILE_UPLOAD: 15000,         // 15 seconds
  EXTERNAL_API: 20000,        // 20 seconds
  IMAGE_PROCESSING: 25000,    // 25 seconds
} as const;

/**
 * Creates an AbortSignal that times out after the specified duration
 * Use with fetch() API
 */
export function createTimeoutSignal(timeoutMs: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  // Fallback for older environments
  const controller = new AbortController();
  setTimeout(() => controller.abort(new TimeoutError('Fetch request', timeoutMs)), timeoutMs);
  return controller.signal;
}
