/**
 * Next.js Edge Middleware
 * Handles CORS, security, and request preprocessing
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Allowed origins for CORS
 * Add your production domain here when deploying
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.BETTER_AUTH_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'https://aerobase.app',
  'https://www.aerobase.app',
  'https://pheno-app.vercel.app',
  'https://pheno-two.vercel.app',
  'https://pheno-beta.vercel.app',
].filter(Boolean) as string[];

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowedOrigin => origin === allowedOrigin);
}

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check both secure (HTTPS/production) and non-secure (HTTP/local) cookie names
    const sessionCookie = request.cookies.get('__Secure-better-auth.session_token')
      || request.cookies.get('better-auth.session_token');

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Check if user is admin - pass all cookies to preserve session
    try {
      const cookieHeader = request.headers.get('cookie') || '';
      const response = await fetch(new URL('/api/auth/session', request.url), {
        headers: {
          Cookie: cookieHeader,
        },
      });

      if (response.ok) {
        const session = await response.json();
        // Check if user has admin role
        if (!session?.user?.isAdmin) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      } else {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    } catch (error) {
      console.error('Admin auth check failed:', error);
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Apply CORS only to API routes
  if (pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin && isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0] || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400', // 24 hours
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    // For actual requests, add CORS headers
    const response = NextResponse.next();

    if (origin && isAllowedOrigin(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    return response;
  }

  // For non-API routes, just continue
  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    '/api/:path*', // All API routes
    '/admin/:path*', // All admin routes
  ],
};
