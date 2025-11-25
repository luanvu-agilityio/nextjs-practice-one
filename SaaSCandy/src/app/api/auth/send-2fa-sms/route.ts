/**
 * API route for sending and verifying SMS 2FA codes during sign-in.
 *
 * - Stores codes in Neon Postgres via Drizzle ORM.
 * - Sends SMS via Twilio.
 * - Supports POST (send code) and PUT (verify code).
 */
import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import { eq } from 'drizzle-orm';

// DB
import { db } from '@/lib/db';

// Schema
import * as schema from '@/lib/db/schema';

// Auth
import { auth } from '@/lib/better-auth';

// Helpers
import { sendSms, isTwilioConfigured } from '@/lib/twilio';

interface SmsResult {
  success: boolean;
  message?: string;
  data?: boolean;
  error?: string;
  details?: string;
  status?: number;
}

export async function POST(request: NextRequest) {
  // Effect returns plain data
  const program = Effect.gen(function* () {
    const body = yield* Effect.promise(() => request.json().catch(() => null));
    console.log('[send-2fa-sms] POST body:', body);
    const { phone, email, password } = body || {};

    if (!phone) {
      return {
        success: false,
        message: 'Phone required',
        error: 'Phone required',
        status: 400,
      } as SmsResult;
    }

    // Optionally validate user credentials
    type UserLike = {
      id: string;
      phone?: string;
      [key: string]: unknown;
    } | null;
    let user: UserLike = null;

    if (email && password) {
      const signInResult = yield* Effect.promise(() =>
        auth.api.signInEmail({ body: { email, password } })
      );
      if (!signInResult?.user) {
        return {
          success: false,
          message: 'Invalid credentials',
          error: 'Invalid credentials',
          status: 401,
        } as SmsResult;
      }
      user = signInResult.user;
    } else {
      // Find user by phone
      const users = yield* Effect.promise(() =>
        db
          .select()
          .from(schema.user)
          .where(eq(schema.user.twoFactorEnabled, true))
      );
      const found = users.find(u => {
        const p = (u as Record<string, unknown>).phone;
        return typeof p === 'string' && p === phone;
      });
      user = (found as UserLike) ?? null;
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'User not found',
          status: 404,
        } as SmsResult;
      }
    }

    // Generate and store code
    const { createSmsOtp } = yield* Effect.promise(() => import('@/lib/otp'));
    const { code } = yield* Effect.promise(() => createSmsOtp(user!.id, phone));

    // Send SMS via centralized helper
    if (!isTwilioConfigured()) {
      console.error('[send-2fa-sms] Twilio not configured');
      return {
        success: false,
        message: 'Twilio configuration missing',
        error: 'Twilio configuration missing',
        status: 500,
      } as SmsResult;
    }

    yield* Effect.promise(() =>
      sendSms(phone, `Your SaaSCandy verification code is: ${code}`)
    );

    return {
      success: true,
      message: 'SMS code sent',
      status: 200,
    } as SmsResult;
  });

  try {
    // Run Effect and get plain result
    const result = (await Effect.runPromise(program)) as SmsResult;

    // Map to NextResponse at boundary
    const status = result.status || (result.success ? 200 : 400);
    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        ...(result.error && { error: result.error }),
        ...(result.details && { details: result.details }),
      },
      { status }
    );
  } catch (error: unknown) {
    let details: string;
    if (typeof error === 'string') {
      details = error;
    } else if (error instanceof Error) {
      details = error.message;
    } else if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      details = String((error as { message: unknown }).message);
    } else {
      details = error ? JSON.stringify(error) : 'Unknown error';
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send SMS',
        error: 'Failed to send SMS',
        details,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Effect returns plain data
  const program = Effect.gen(function* () {
    const body = yield* Effect.promise(() => request.json());
    const { phone, code } = body || {};

    if (!phone || !code) {
      return {
        success: false,
        message: 'Phone and code required',
        error: 'Phone and code required',
        status: 400,
      } as SmsResult;
    }

    // Find code entry
    const entries = yield* Effect.promise(() =>
      db
        .select()
        .from(schema.smsVerificationCode)
        .where(eq(schema.smsVerificationCode.phone, phone))
    );
    const entry = entries[0];

    if (!entry || entry.expiresAt < new Date()) {
      return {
        success: false,
        message: 'Code expired',
        error: 'Code expired',
        status: 400,
      } as SmsResult;
    }

    if (entry.code !== code) {
      // Optionally increment attempts
      yield* Effect.promise(() =>
        db
          .update(schema.smsVerificationCode)
          .set({ attempts: String(Number(entry.attempts || '0') + 1) })
          .where(eq(schema.smsVerificationCode.id, entry.id))
      );
      return {
        success: false,
        message: 'Invalid code',
        error: 'Invalid code',
        status: 401,
      } as SmsResult;
    }

    // Mark as verified and delete code
    yield* Effect.promise(() =>
      db
        .delete(schema.smsVerificationCode)
        .where(eq(schema.smsVerificationCode.id, entry.id))
    );

    return { success: true, data: true, status: 200 } as SmsResult;
  });

  try {
    // Run Effect and get plain result
    const result = (await Effect.runPromise(program)) as SmsResult;

    // Map to NextResponse at boundary
    const status = result.status || (result.success ? 200 : 400);
    return NextResponse.json(
      {
        success: result.success,
        ...(result.data !== undefined && { data: result.data }),
        ...(result.message && { message: result.message }),
        ...(result.error && { error: result.error }),
      },
      { status }
    );
  } catch (error: unknown) {
    let details: string;
    if (typeof error === 'string') {
      details = error;
    } else if (error instanceof Error) {
      details = error.message;
    } else {
      details = 'Unknown error';
    }

    return NextResponse.json(
      {
        success: false,
        message: details,
        error: details === 'Unexpected error' ? 'Unexpected' : details,
      },
      { status: 500 }
    );
  }
}
