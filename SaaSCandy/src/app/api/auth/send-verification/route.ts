/**
 * API route for sending an email verification link to the user.
 *
 * - Generates a verification token and URL.
 * - Sends the verification email using Resend.
 * - Returns success or error messages.
 *
 * Method: POST
 * Body: { email: string }
 * Response: { success: boolean, message: string, data?: unknown }
 */
import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Constants
import { VerificationEmail } from '@/constants/email-template';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const token = crypto.randomUUID();
    const verificationUrl = `${process.env.BETTER_AUTH_URL}/email-verification?token=${token}`;

    const result = await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
      to: email,
      subject: 'Verify your email - SaaSCandy',
      html: VerificationEmail({ verificationUrl }),
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      data: result,
    });
  } catch (error: unknown) {
    let message = 'Failed to send email';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        // keep default message
      }
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 200 }
    );
  }
}
