/**
 * Centralized error handling for API routes
 * Ensures sensitive information is never exposed to users in production
 */

export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}

/**
 * Format error for API response
 * In production: Returns generic messages, logs full error server-side
 * In development: Returns detailed error information
 */
export function formatApiError(error: any, userMessage?: string): {
  error: string;
  code?: string;
  details?: any;
} {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log full error server-side
  console.error('[API Error]', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...(error.code && { code: error.code }),
  });

  // Return safe error to client
  const baseError = {
    error: userMessage || "An error occurred. Please try again.",
  };

  // Only include details in development
  if (isDevelopment) {
    return {
      ...baseError,
      code: error.code || error.name,
      details: error.message,
      ...(error.stack && { stack: error.stack }),
    } as any;
  }

  return baseError;
}

/**
 * Common error responses for API routes
 */
export const ApiErrors = {
  unauthorized: {
    error: "Authentication required. Please sign in.",
    statusCode: 401,
  },
  forbidden: {
    error: "You don't have permission to access this resource.",
    statusCode: 403,
  },
  notFound: {
    error: "Resource not found.",
    statusCode: 404,
  },
  badRequest: (message: string) => ({
    error: message,
    statusCode: 400,
  }),
  rateLimit: (resetIn: string) => ({
    error: `Rate limit exceeded. Please try again in ${resetIn}.`,
    statusCode: 429,
  }),
  serverError: {
    error: "An unexpected error occurred. Please try again later.",
    statusCode: 500,
  },
  serviceUnavailable: (service: string) => ({
    error: `${service} is temporarily unavailable. Please try again later.`,
    statusCode: 503,
  }),
};

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): { isValid: boolean; error?: string } {
  for (const field of requiredFields) {
    if (!body[field]) {
      return {
        isValid: false,
        error: `Missing required field: ${field}`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Safe error wrapper for async operations
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error: any) {
    console.error(`[Safe Async Error] ${errorMessage}:`, error);
    return {
      error: {
        message: errorMessage,
        statusCode: 500,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.message,
        }),
      },
    };
  }
}
