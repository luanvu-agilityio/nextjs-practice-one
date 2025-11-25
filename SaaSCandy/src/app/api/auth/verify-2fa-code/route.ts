/**
 * API route for verifying a 2FA code sent to the user's email during sign-in.
 *
 * - Validates the request body for email and code.
 * - Checks code format (6 digits).
 * - Finds the user and the latest unverified code record.
 * - Handles expired codes and max attempt limits.
 * - Marks the code as verified if correct, and returns credentials for sign-in.
 * - Returns appropriate error messages for all failure cases.
 *
 * Method: POST
 * Body: { email: string, code: string }
 * Response: { success: boolean, data?: { email, password }, error?: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import { and, eq, gt } from 'drizzle-orm';

// DB
import { db } from '@/lib/db';

// Schema
import * as schema from '@/lib/db/schema';

// Helpers
const MAX_ATTEMPTS = 3;

interface VerifyResult {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    email: string;
    password: string;
  };
  status?: number;
}

export async function POST(request: NextRequest) {
  // Effect returns plain data
  const program = Effect.gen(function* () {
    const body = yield* Effect.promise(() => request.json());
    const { email, code } = body;

    // Validation
    if (!email || !code) {
      return {
        success: false,
        message: 'Email and code are required',
        error: 'Email and code are required',
        status: 400,
      } as VerifyResult;
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: 'Code must be 6 digits',
        error: 'Code must be 6 digits',
        status: 400,
      } as VerifyResult;
    }

    // Find user by email
    const user = yield* Effect.promise(() =>
      db.query.user.findFirst({
        where: eq(schema.user.email, email),
      })
    );

    // Case 1: User doesn't exist
    if (!user) {
      return {
        success: false,
        message: 'Invalid verification code',
        error: 'Invalid verification code',
        status: 400,
      } as VerifyResult;
    }

    // Find latest verification code for this user
    const verificationRecord = yield* Effect.promise(() =>
      db.query.emailVerificationCode.findFirst({
        where: and(
          eq(schema.emailVerificationCode.userId, user.id),
          eq(schema.emailVerificationCode.code, code),
          eq(schema.emailVerificationCode.verified, false),
          gt(schema.emailVerificationCode.expiresAt, new Date())
        ),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
      })
    );

    // Case 2: No verification code found or expired
    if (!verificationRecord) {
      return {
        success: false,
        message: 'Verification code expired. Please request a new one.',
        error: 'Verification code expired. Please request a new one.',
        status: 400,
      } as VerifyResult;
    }

    // Case 3: Too many attempts
    const attempts = Number.parseInt(verificationRecord.attempts || '0');
    if (attempts >= MAX_ATTEMPTS) {
      // Delete the code
      yield* Effect.promise(() =>
        Promise.resolve(
          db
            .delete(schema.emailVerificationCode)
            .where(eq(schema.emailVerificationCode.id, verificationRecord.id))
        )
      );

      return {
        success: false,
        message: 'Too many failed attempts. Please request a new code.',
        error: 'Too many failed attempts. Please request a new code.',
        status: 400,
      } as VerifyResult;
    }

    // Case 4: Wrong code
    if (verificationRecord.code !== code) {
      yield* Effect.promise(() =>
        Promise.resolve(
          db
            .update(schema.emailVerificationCode)
            .set({ attempts: String(attempts + 1) })
            .where(eq(schema.emailVerificationCode.id, verificationRecord.id))
        )
      );

      const remainingAttempts = MAX_ATTEMPTS - (attempts + 1);
      const msg = `Invalid code. ${remainingAttempts} attempt${
        remainingAttempts === 1 ? '' : 's'
      } remaining.`;
      return {
        success: false,
        message: msg,
        error: msg,
        status: 400,
      } as VerifyResult;
    }

    // Case 5: Correct code - Mark as verified
    yield* Effect.promise(() =>
      Promise.resolve(
        db
          .update(schema.emailVerificationCode)
          .set({ verified: true })
          .where(eq(schema.emailVerificationCode.id, verificationRecord.id))
      )
    );

    // Return credentials for client-side sign-in
    return {
      success: true,
      data: {
        email: user.email,
        // For DEMO: Return plain password stored during send-code
        password: verificationRecord.tempPassword || '',
      },
      message: 'Verification successful',
      status: 200,
    } as VerifyResult;
  });

  try {
    // Run Effect and get plain result
    const result = (await Effect.runPromise(program)) as VerifyResult;

    // Map to NextResponse at boundary
    const status = result.status || (result.success ? 200 : 400);
    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        ...(result.data && { data: result.data }),
        ...(result.error && { error: result.error }),
      },
      { status }
    );
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.';
    return NextResponse.json(
      { success: false, message: 'Failed to verify code', error: errorMsg },
      { status: 500 }
    );
  }
}
