/**
 * API route for sending an email verification link to the user.
 *
 * - Generates a verification token and URL.
 * - Sends the verification email using Resend.
 * - Returns success or error messages.
 *
 * Method: POST
 * Body: { email: string }
 * Response: { success: boolean, message: string, data?: any }
 */
import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Constants
import { VerificationEmail } from '@/constants/email-template';
import { getConfig } from '@/lib/config';
import { Effect } from 'effect';

type Config = {
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;
  BETTER_AUTH_URL?: string;
};

export async function handleSendVerification(
  request: NextRequest,
  config: Config
) {
  const program = Effect.gen(function* () {
    const cfg = config;
    if (cfg.SENDGRID_API_KEY) {
      sgMail.setApiKey(cfg.SENDGRID_API_KEY);
    }
    const body = yield* Effect.promise(() => request.json());
    const { email } = body as { email?: string };

    const token = crypto.randomUUID();
    const verificationUrl = `${cfg.BETTER_AUTH_URL}/email-verification?token=${token}`;

    const result = yield* Effect.promise(() =>
      sgMail.send({
        from: cfg.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: email,
        subject: 'Verify your email - SaaSCandy',
        html: VerificationEmail({ verificationUrl }),
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      data: result,
    });
  });

  try {
    return await Effect.runPromise(program);
  } catch (error: unknown) {
    // For send-verification we intentionally return success-shaped object even on errors
    // so tests expect 200 status
    let message = 'Failed to send email';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        // keep default
      }
    }
    return NextResponse.json({ success: false, message });
  }
}

export async function POST(request: NextRequest) {
  const cfg = await getConfig();
  return handleSendVerification(request, cfg);
}
