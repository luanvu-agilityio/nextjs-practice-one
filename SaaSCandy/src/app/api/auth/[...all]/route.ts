/**
 * API catch-all route for Better Auth.
 *
 * - Handles all GET and POST requests for authentication endpoints.
 * - Uses Better Auth's Next.js handler to route requests.
 * - Supports sign-in, sign-up, session, and other auth actions.
 */
import { auth } from '@/lib/better-auth';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest, NextResponse } from 'next/server';

const handlers = toNextJsHandler(auth);
const mask = (s?: string | null) => (s ? '‹redacted›' : null);

export const GET = handlers.GET;

export const POST = async (request: NextRequest) => {
  try {
    const path = new URL(request.url).pathname;

    const isSignIn =
      path.includes('/api/auth/sign-in') ||
      path.includes('/api/auth/signin') ||
      path.includes('/auth/sign-in') ||
      path.includes('/sign-in');

    if (isSignIn) {
      try {
        const cloned = request.clone();
        const body = await cloned.json().catch(() => ({}));
        console.log('[auth-proxy] sign-in attempt', {
          email: body?.email ?? null,
          passwordPreview: mask(body?.password),
          path,
        });
      } catch (err) {
        console.warn('[auth-proxy] failed to read sign-in body', err);
      }

      const response = await handlers.POST(request);

      // try to read JSON, fallback to text for raw error
      try {
        const respClone = response.clone();
        let body: unknown;
        try {
          body = await respClone.json();
        } catch {
          body = await respClone.text();
        }
        console.log('[auth-proxy] sign-in response', {
          status: response.status ?? 'unknown',
          body,
        });
      } catch (err) {
        console.warn('[auth-proxy] failed to read sign-in response body', err);
      }

      return response;
    }

    return await handlers.POST(request);
  } catch (err) {
    console.error('[auth-proxy] unexpected error', err);
    return NextResponse.json(
      { success: false, message: 'Internal auth proxy error' },
      { status: 500 }
    );
  }
};
