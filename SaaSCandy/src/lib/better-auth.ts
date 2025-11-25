/**
 * Better Auth configuration for authentication and user management.
 *
 * - Uses Drizzle ORM adapter for PostgreSQL.
 * - Enables email/password and social authentication (Google, GitHub).
 * - Supports email verification and password reset via Resend.
 * - Integrates two-factor authentication (2FA) plugin (supports email and can be extended for SMS).
 * - Sends custom verification and reset emails.
 */
import { betterAuth } from 'better-auth';
import sgMail from '@sendgrid/mail';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { twoFactor } from 'better-auth/plugins';
import { sendSms } from './twilio';

// DB
import { db } from './db';

// Constants
import {
  PasswordChangedAlertEmail,
  ResetPasswordEmail,
  VerificationEmail,
} from '@/constants/email-template';

// Config
import { getConfig } from '@/lib/config';

// Load configuration at module initialization (server-side)
const cfg = await getConfig();

if (cfg.SENDGRID_API_KEY) {
  sgMail.setApiKey(cfg.SENDGRID_API_KEY);
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),

  secret: cfg.BETTER_AUTH_SECRET,
  baseURL: cfg.BETTER_AUTH_URL || 'http://localhost:3000',

  emailVerification: {
    enabled: true,
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, token }) => {
      const verificationUrl = `${cfg.BETTER_AUTH_URL}/email-verification?token=${token}`;

      await sgMail.send({
        from: cfg.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: user.email,
        subject: 'Verify your email - SaaSCandy',
        html: VerificationEmail({ verificationUrl }),
      });
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user: authUser, token }) => {
      const resetUrl = `${cfg.BETTER_AUTH_URL}/reset-password?token=${token}`;

      await sgMail.send({
        from: cfg.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: authUser.email,
        subject: 'Reset your password - SaaSCandy',
        html: ResetPasswordEmail({ resetUrl }),
      });
    },
    onPasswordReset: async ({ user }) => {
      await sgMail.send({
        from: cfg.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: user.email,
        subject: 'Password Changed Successfully - SaaSCandy',
        html: PasswordChangedAlertEmail(),
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

      sendOtp: async (payload: unknown) => {
        const p = payload as {
          destination: string;
          method?: string;
          code: string;
        };
        try {
          if (p.method === 'sms') {
            await sendSms(
              p.destination,
              `Your SaaSCandy verification code is: ${p.code}`
            );
            return true;
          }
        } catch (err) {
          console.error('twoFactor sendOtp error', err);
          return false;
        }
        return false;
      },
    } as Parameters<typeof twoFactor>[0]),
  ],

  socialProviders: {
    google: {
      clientId: cfg.GOOGLE_CLIENT_ID || '',
      clientSecret: cfg.GOOGLE_CLIENT_SECRET || '',
      enabled: !!cfg.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: cfg.GITHUB_ID || '',
      clientSecret: cfg.GITHUB_SECRET || '',
      enabled: !!cfg.GITHUB_ID,
    },
  },

  logger: {
    level: 'debug',
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = (typeof auth.$Infer.Session)['user'];
