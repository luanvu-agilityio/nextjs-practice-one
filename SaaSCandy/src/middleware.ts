/**
 * Next.js middleware for route protection and authentication using Effect.
 *
 * - Allows static assets, Next.js internals, and public routes to pass through.
 * - Checks if the current route is protected.
 * - If protected, verifies the user's session using Better Auth (via Effect).
 * - Redirects unauthenticated users to the sign-in page, preserving the original path.
 * - Handles authentication errors gracefully using Effect error handling.
 *
 * Configuration:
 *   - Uses a matcher to exclude API/auth, static, image, and favicon routes from middleware.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { PROTECTED_ROUTES, PUBLIC_ROUTES } from './constants';

export const runtime = 'nodejs';

const isStaticOrInternalRoute = (pathname: string): boolean =>
  pathname.startsWith('/_next') ||
  pathname.startsWith('/api/auth') ||
  pathname.startsWith('/static') ||
  pathname.includes('.');

const isPublicRoute = (pathname: string): boolean =>
  PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  });

const isProtectedRoute = (pathname: string): boolean =>
  PROTECTED_ROUTES.some(route => pathname.startsWith(route));

/**
 * Get session via Better Auth runtime API (lazy import at request-time).
 */
const getSessionAsync = async (request: NextRequest) => {
  try {
    const mod = await import('@/lib/better-auth');
    const { auth } = mod as unknown as {
      auth: {
        api: { getSession: (opts: { headers: Headers }) => Promise<unknown> };
      };
    };
    const session = await auth.api.getSession({ headers: request.headers });
    return session as unknown;
  } catch (error) {
    return {
      _tag: 'SessionError' as const,
      message: error instanceof Error ? error.message : 'Unknown session error',
    };
  }
};

// Type guard for the error shape returned by `getSessionAsync` on failure.
const isSessionError = (
  obj: unknown
): obj is { _tag: 'SessionError'; message?: string } =>
  typeof obj === 'object' &&
  obj !== null &&
  (obj as { _tag?: unknown })._tag === 'SessionError';

/**
 * Create redirect URL with original path preserved
 */
const createRedirectUrl = (origin: string, pathname: string): URL => {
  const url = new URL('/signin', origin);
  url.searchParams.set('from', pathname);
  return url;
};

/**
 * Validate session exists
 */
const validateSession = (session: unknown) => {
  if (
    !session ||
    (typeof session === 'object' && session !== null && !('user' in session))
  ) {
    return {
      ok: false,
      error: { _tag: 'Unauthorized' as const, message: 'No session found' },
    } as const;
  }
  return { ok: true, session } as const;
};

/**
 * Handle protected route authentication
 */
const handleProtectedRoute = async (request: NextRequest) => {
  const { pathname, origin } = request.nextUrl;

  const sessionOrError = await getSessionAsync(request);
  if (isSessionError(sessionOrError)) {
    console.error('[middleware] Authentication error:', sessionOrError.message);
    const url = createRedirectUrl(origin, pathname);
    return NextResponse.redirect(url);
  }

  const validated = validateSession(sessionOrError);
  if (!validated.ok) {
    const url = createRedirectUrl(origin, pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

/**
 * Main middleware logic as an Effect
 */
const middlewareEffect = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Early return for static/internal routes
  if (isStaticOrInternalRoute(pathname)) {
    return NextResponse.next();
  }

  // Early return for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (isProtectedRoute(pathname)) {
    return handleProtectedRoute(request);
  }

  // Default: allow through
  return NextResponse.next();
};

/**
 * Runs the Effect and returns the result.
 */
export default async function middleware(request: NextRequest) {
  const res = await middlewareEffect(request);
  return res as NextResponse;
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
