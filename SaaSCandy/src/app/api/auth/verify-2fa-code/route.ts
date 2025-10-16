import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { message: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.query.user.findFirst({
      where: eq(schema.user.email, email),
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
    }

    // Find verification record
    const verification = await db.query.verification.findFirst({
      where: (v, { and, eq }) =>
        and(eq(v.identifier, user.id), eq(v.type, 'email_2fa')),
    });

    if (!verification) {
      return NextResponse.json(
        { message: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Parse stored data
    let storedData;
    try {
      storedData = JSON.parse(verification.value);
    } catch (error) {
      console.error(
        '[verify-2fa-code] Failed to parse verification data:',
        error
      );
      return NextResponse.json(
        { message: 'Invalid verification data' },
        { status: 400 }
      );
    }

    // Check if code matches
    const inputCode = String(code).trim();
    const storedCode = String(storedData.code).trim();

    if (inputCode !== storedCode) {
      return NextResponse.json(
        { message: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (verification.expiresAt.getTime() < Date.now()) {
      await db
        .delete(schema.verification)
        .where(eq(schema.verification.id, verification.id));

      return NextResponse.json(
        { message: 'Code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Delete used code
    await db
      .delete(schema.verification)
      .where(eq(schema.verification.id, verification.id));

    return NextResponse.json({
      success: true,
      message: 'Code verified',
      data: {
        email: user.email,
        password: storedData.password,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Verification failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
