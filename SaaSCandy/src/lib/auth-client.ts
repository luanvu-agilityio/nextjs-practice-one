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

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [twoFactorClient()],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  updateUser,
  twoFactor: { enable: enableTwoFactor, disable: disableTwoFactor, verifyOtp },
} = authClient;
