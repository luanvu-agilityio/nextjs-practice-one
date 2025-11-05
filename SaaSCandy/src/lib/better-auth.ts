/**
 * Better Auth configuration for authentication and user management.
 *
 * - Uses Drizzle ORM adapter for PostgreSQL.
 * - Enables email/password and social authentication (Google, GitHub).
 * - Supports email verification and password reset via Resend.
 * - Integrates two-factor authentication (2FA) plugin (supports email and can be extended for SMS).
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
    resetPasswordTokenExpiresIn: 3600, // 1 hour in seconds
    sendResetPassword: async ({ user: authUser, url }) => {
      console.log(
        '[better-auth] 🔐 sendResetPassword - User:',
        authUser.email,
        '(ID:',
        authUser.id,
        ')'
      );
      console.log(
        '[better-auth] ℹ️ Token stored in verification table by Better Auth'
      );
      console.log('[better-auth] 🔗 Reset URL:', url);

      try {
        await sgMail.send({
          from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
          to: authUser.email,
          subject: 'Reset your password - SaaSCandy',
          html: ResetPasswordEmail({ resetUrl: url }),
        });

        console.log(
          '[better-auth] ✅ Reset email sent successfully to:',
          authUser.email
        );
      } catch (error) {
        console.error('[better-auth] ❌ Failed to send reset email:', error);
        throw error;
      }
    },
    onPasswordReset: async ({ user }) => {
      // Send confirmation email after successful password reset
      console.log(
        '[better-auth] 🔄 Password reset successful for user:',
        user.email
      );

      try {
        await sgMail.send({
          from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
          to: user.email,
          subject: 'Password Changed Successfully - SaaSCandy',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6366f1;">Password Changed Successfully</h2>
              <p>Your password has been changed successfully.</p>
              <p>If you didn't make this change, please contact support immediately.</p>
              <p style="margin-top: 30px; color: #666;">
                Best regards,<br/>
                SaaSCandy Team
              </p>
            </div>
          `,
        });
        console.log(
          '[better-auth] ✅ Password change confirmation email sent to:',
          user.email
        );
      } catch (error) {
        console.error(
          '[better-auth] ❌ Failed to send confirmation email:',
          error
        );
      }
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
