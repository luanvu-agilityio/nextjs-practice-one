// /**
//  * API catch-all route for Better Auth.
//  *
//  * - Handles all GET and POST requests for authentication endpoints.
//  * - Uses Better Auth's Next.js handler to route requests.
//  * - Supports sign-in, sign-up, session, and other auth actions.
//  */
// import { auth } from '@/lib/better-auth';
// import { toNextJsHandler } from 'better-auth/next-js';

// export const { GET, POST } = toNextJsHandler(auth);
import { auth } from '@/lib/better-auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handlers = toNextJsHandler(auth);

// simple helper to safely preview password
const mask = (s?: string | null) => (s ? '‹redacted›' : null);

// Export GET as-is
export const GET = handlers.GET;

// Wrap POST so we can log sign-in attempts and responses
export const POST = async (request: NextRequest) => {
  try {
    const path = new URL(request.url).pathname;

    // If this is the sign-in by email route, read body from a clone for logging only
    if (
      path.includes('/api/auth/sign-in') ||
      path.includes('/api/auth/signin') ||
      path.includes('/auth/sign-in')
    ) {
      try {
        const cloned = request.clone();
        const body = await cloned.json().catch(() => ({}));
        // log minimal safe info
        console.log('[auth-proxy] sign-in attempt', {
          email: body?.email ?? null,
          passwordPreview: mask(body?.password),
        });
      } catch (err) {
        console.warn('[auth-proxy] failed to read sign-in body', err);
      }

      // forward original request to Better Auth
      const response = await handlers.POST(request);

      // try to capture response JSON for debugging (dev only)
      try {
        // NextResponse is a native Response-like object; clone then read
        const respClone = response.clone();
        const json = await respClone.json().catch(() => undefined);
        console.log('[auth-proxy] sign-in response', {
          status: response.status,
          body: json,
        });
      } catch (err) {
        // non-fatal
        console.warn('[auth-proxy] failed to read sign-in response body', err);
      }

      return response;
    }

    // Non-sign-in POSTs: pass through unchanged
    return await handlers.POST(request);
  } catch (err) {
    console.error('[auth-proxy] unexpected error', err);
    return NextResponse.json(
      { success: false, message: 'Internal auth proxy error' },
      { status: 500 }
    );
  }
};
