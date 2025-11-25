/**
 * Client-side authentication utilities using Better Auth for React.
 *
 * - Provides sign-in, sign-up, sign-out, session hooks, and user update functions.
 * - Supports two-factor authentication (2FA) via the twoFactorClient plugin.
 * - Uses the app's base URL from environment variables.
 *
 * Usage:
 *   import { signIn, useSession } from '@/lib/auth-client';
 */
import { createAuthClient } from 'better-auth/react';
import { twoFactorClient } from 'better-auth/client/plugins';

/**
 * Create an `authClient`. Tests can call `makeAuthClient` with an
 * `overrideBaseURL` to avoid module-level environment coupling.
 */
export function makeAuthClient(overrideBaseURL?: string) {
  return createAuthClient({
    baseURL:
      overrideBaseURL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      'http://localhost:3000',
    plugins: [twoFactorClient()],
  });
}

export const authClient = makeAuthClient();

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  twoFactor: { enable: enableTwoFactor, disable: disableTwoFactor, verifyOtp },
} = authClient;

/**
 * Helper to return a normalized access token for client code.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const s = await getSession();
    return (
      (s as unknown as { data?: { session?: { token?: string } } })?.data
        ?.session?.token ?? null
    );
  } catch {
    return null;
  }
}
