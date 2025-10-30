/**
 * Better Auth configuration for authentication and user management.
 *
 * - Uses Drizzle ORM adapter for PostgreSQL.
 * - Enables email/password and social authentication (Google, GitHub).
 * - Supports email verification and password reset via Resend.
<<<<<<< Updated upstream
 * - Integrates two-factor authentication (2FA) plugin.
=======
 * - Integrates two-factor authentication (2FA) plugin (supports email and can be extended for SMS).
>>>>>>> Stashed changes
 * - Sends custom verification and reset emails.
 *
 * Exports:
 *   - `auth`: Better Auth instance for use in API routes and middleware.
 *   - `Session`, `User`: Type definitions for session and user objects.
 */
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import sgMail from '@sendgrid/mail';

import { db } from './db';
import {
  ResetPasswordEmail,
  VerificationEmail,
} from '@/constants/email-template';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${process.env.BETTER_AUTH_URL}/email-verification?token=${token}`;

      await sgMail.send({
        from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: user.email,
        subject: 'Verify your email - SaaSCandy',
        html: VerificationEmail({ verificationUrl }),
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const resetUrl = `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`;

      await sgMail.send({
        from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: user.email,
        subject: 'Reset your password - SaaSCandy',
        html: ResetPasswordEmail({ resetUrl }),
      });
    },
  },

  plugins: [
    twoFactor({
      issuer: 'SaaSCandy',
      otpOptions: {
        period: 30,
        digits: 6,
      },
      // To support SMS 2FA, extend plugin here or use custom API route (see send-2fa-sms)
    }),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
      enabled: !!process.env.GITHUB_ID,
    },
  },

  logger: {
    level: 'debug',
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = (typeof auth.$Infer.Session)['user'];
