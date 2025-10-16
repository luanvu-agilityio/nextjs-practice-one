import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { TwoFactorEmail } from '@/constants/email-template';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a code has been sent',
      });
    }

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store code and password as JSON
    const dataToStore = JSON.stringify({
      code,
      password,
    });

    // Check if a verification record already exists
    const existingVerification = await db.query.verification.findFirst({
      where: (v, { and, eq }) =>
        and(eq(v.identifier, user.id), eq(v.type, 'email_2fa')),
    });

    if (existingVerification) {
      await db
        .update(schema.verification)
        .set({
          value: dataToStore,
          expiresAt: new Date(expiresAt),
        })
        .where(eq(schema.verification.id, existingVerification.id));
    } else {
      await db.insert(schema.verification).values({
        id: crypto.randomUUID(),
        identifier: user.id,
        value: dataToStore,
        expiresAt: new Date(expiresAt),
        type: 'email_2fa',
      });
    }

    // Send email with code
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: 'Your SaaSCandy Login Code',
      html: TwoFactorEmail({ code, userName: user.name || 'User' }),
    });

    return NextResponse.json({
      success: true,
      message: 'Login code sent to your email',
      data: result,
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object'
          ? JSON.stringify(error)
          : String(error);

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
