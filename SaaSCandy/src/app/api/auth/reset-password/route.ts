/**
 * Effect-based API route using Effect.gen syntax.
 *
 * Pattern: Effect returns plain data, route handler maps to NextResponse.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import { auth } from '@/lib/better-auth';

interface ResetResult {
  user?: unknown;
  ok?: boolean;
  success?: boolean;
  status?: boolean | number;
  message?: string;
  error?: string;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  // Effect returns plain data (not NextResponse)
  const program = Effect.gen(function* () {
    const body = yield* Effect.promise(() => request.json());
    const { token, newPassword } = body ?? {};

    if (!token || !newPassword || typeof newPassword !== 'string') {
      return {
        success: false,
        message: 'Token and new password required',
      } as ResetPasswordResult;
    }

    const result = yield* Effect.promise(() =>
      auth.api.resetPassword({
        body: { token, newPassword },
      })
    );

    const resetResult = result as ResetResult;

    if (
      resetResult?.user ||
      resetResult?.ok ||
      resetResult?.success ||
      resetResult?.status === true
    ) {
      return {
        success: true,
        message: resetResult?.message || 'Password updated successfully',
      } as ResetPasswordResult;
    }

    const msg =
      resetResult?.error || resetResult?.message || 'Invalid or expired token';

    return { success: false, message: msg } as ResetPasswordResult;
  });

  try {
    // Run Effect and get plain result
    const result = (await Effect.runPromise(program)) as ResetPasswordResult;

    // Map to NextResponse at boundary
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message === 'Unexpected error'
          ? 'Something went wrong. Please try again.'
          : error.message === 'Invalid JSON'
            ? 'Something went wrong. Please try again.'
            : error.message
        : 'Something went wrong. Please try again.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
