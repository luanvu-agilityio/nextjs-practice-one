import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { and, eq, gt } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';

const MAX_ATTEMPTS = 3;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    // Validation
    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, error: 'Code must be 6 digits' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    // Case 1: User doesn't exist
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Find latest verification code for this user
    const verificationRecord = await db.query.emailVerificationCode.findFirst({
      where: and(
        eq(schema.emailVerificationCode.userId, user.id),
        eq(schema.emailVerificationCode.code, code),
        eq(schema.emailVerificationCode.verified, false),
        gt(schema.emailVerificationCode.expiresAt, new Date())
      ),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });

    // Case 2: No verification code found or expired
    if (!verificationRecord) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification code expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Case 3: Too many attempts
    const attempts = Number.parseInt(verificationRecord.attempts || '0');
    if (attempts >= MAX_ATTEMPTS) {
      // Delete the code
      await db
        .delete(schema.emailVerificationCode)
        .where(eq(schema.emailVerificationCode.id, verificationRecord.id));

      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed attempts. Please request a new code.',
        },
        { status: 400 }
      );
    }

    // Case 4: Wrong code
    if (verificationRecord.code !== code) {
      await db
        .update(schema.emailVerificationCode)
        .set({ attempts: String(attempts + 1) })
        .where(eq(schema.emailVerificationCode.id, verificationRecord.id));

      const remainingAttempts = MAX_ATTEMPTS - (attempts + 1);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
        },
        { status: 400 }
      );
    }

    // Case 5: Correct code - Mark as verified
    await db
      .update(schema.emailVerificationCode)
      .set({ verified: true })
      .where(eq(schema.emailVerificationCode.id, verificationRecord.id));

    // Return credentials for client-side sign-in
    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        // For DEMO: Return plain password stored during send-code
        password: verificationRecord.tempPassword || '',
      },
      message: 'Verification successful',
    });
  } catch (error: unknown) {
    console.error('Verify 2FA error:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify code',
        error: errMessage,
      },
      { status: 500 }
    );
  }
}
