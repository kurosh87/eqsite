import { NextResponse } from "next/server";

// Force Node.js runtime for Better Auth compatibility
export const runtime = "nodejs";

// Check environment variables at startup (development only)
const envCheck = {
  hasSecret: !!process.env.BETTER_AUTH_SECRET,
  hasUrl: !!process.env.BETTER_AUTH_URL || !!process.env.NEXT_PUBLIC_APP_URL,
  hasDb: !!process.env.DATABASE_URL,
};

// Lazy load auth to catch initialization errors
let auth: any = null;
let authInitError: Error | null = null;

async function getAuth() {
  if (authInitError) throw authInitError;
  if (auth) return auth;

  try {
    const authModule = await import("@/lib/auth");
    auth = authModule.auth;
    return auth;
  } catch (error: any) {
    authInitError = error;
    console.error("Failed to initialize Better Auth:", error);
    throw error;
  }
}

export const POST = async (request: Request) => {
  const url = new URL(request.url);

  try {
    const authInstance = await getAuth();
    return await authInstance.handler(request);
  } catch (error: any) {
    console.error("Better Auth POST error:", error);
    return NextResponse.json(
      {
        error: "auth_handler_error",
        message: process.env.NODE_ENV === "development" ? (error?.message || "Unknown error") : "Authentication error",
        ...(process.env.NODE_ENV === "development" && {
          stack: error?.stack,
          envCheck,
          path: url.pathname,
        }),
      },
      { status: 500 }
    );
  }
};

export const GET = async (request: Request) => {
  const url = new URL(request.url);

  try {
    const authInstance = await getAuth();
    return await authInstance.handler(request);
  } catch (error: any) {
    console.error("Better Auth GET error:", error);
    return NextResponse.json(
      {
        error: "auth_handler_error",
        message: process.env.NODE_ENV === "development" ? (error?.message || "Unknown error") : "Authentication error",
        ...(process.env.NODE_ENV === "development" && {
          envCheck,
          path: url.pathname,
        }),
      },
      { status: 500 }
    );
  }
};
