import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Constants
import { VerificationEmail } from '@/constants/email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const token = crypto.randomUUID();
    const verificationUrl = `${process.env.BETTER_AUTH_URL}/email-verification?token=${token}`;

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
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
