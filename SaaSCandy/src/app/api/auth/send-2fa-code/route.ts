import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { TwoFactorEmail } from '@/constants/email-template';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';
import bcrypt from 'bcryptjs';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    // Find user by email
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    // Case 1: User doesn't exist
    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a code has been sent',
      });
    }

    // Find account with password
    const account = await db.query.account.findFirst({
      where: eq(schema.account.userId, user.id),
    });

    // Case 2: Account not found or no password (social login only)
    if (!account?.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please sign in using your social account (Google/GitHub)',
        },
        { status: 401 }
      );
    }

    // Case 3: Invalid password
    const isValidPassword = await bcrypt.compare(password, account.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

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
      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
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
