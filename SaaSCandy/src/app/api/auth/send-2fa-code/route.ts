/**
 * API route for sending a 2FA code to the user's email during sign-in.
 *
 * - Validates email and password.
 * - Uses Better Auth to check credentials.
 * - Generates and stores a 6-digit code with expiration.
 * - Sends the code via email using Resend.
 * - Returns success or error messages.
 *
 * Method: POST
 * Body: { email: string, password: string }
 * Response: { success: boolean, message: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { TwoFactorEmail } from '@/constants/email-template';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';
import { auth } from '@/lib/better-auth';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    const signInResult = await auth.api.signInEmail({
      body: { email, password },
    });

    // If sign-in fails, return error
    if (!signInResult?.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // If successful, proceed with sending 2FA code
    const user = signInResult.user;

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unverified codes for this user
    await db
      .delete(schema.emailVerificationCode)
      .where(eq(schema.emailVerificationCode.userId, user.id));

    // Store code in separate table (human-readable)
    await db.insert(schema.emailVerificationCode).values({
      id: crypto.randomUUID(),
      userId: user.id,
      email: user.email,
      code,
      tempPassword: password, // DEMO ONLY - store plain password
      expiresAt,
      verified: false,
      attempts: '0',
    });

    // Send email with code
    try {
      const result = await sgMail.send({
        from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: email,
        subject: 'Your SaaSCandy Login Code',
        html: TwoFactorEmail({ code, userName: user.name || 'User' }),
      });

      console.log('Email sent:', result);
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Continue anyway for demo purposes
    }
    return NextResponse.json({
      success: true,
      message: 'Login code sent to your email',
    });
  } catch (error: unknown) {
    console.error('Send 2FA error:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send login code',
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
