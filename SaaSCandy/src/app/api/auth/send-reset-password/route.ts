import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';

// Auth
import { auth } from '@/lib/better-auth';

// Types for the result
interface ResetResult {
  ok?: boolean;
  success?: boolean;
  status?: boolean | number;
  message?: string;
  [key: string]: unknown;
}

interface ResetPasswordResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  // Effect returns plain data (not NextResponse)
  const program = Effect.gen(function* () {
    const body = yield* Effect.promise(() => request.json().catch(() => null));
    const { email } = body || {};

    if (!email) {
      return {
        success: false,
        message: 'Email required',
        error: 'Email required',
      } as ResetPasswordResult;
    }

    const result = yield* Effect.promise(() =>
      auth.api.requestPasswordReset({ body: { email } })
    );

    const resetResult: ResetResult =
      typeof result === 'object' && result !== null
        ? (result as ResetResult)
        : { message: typeof result === 'string' ? result : undefined };

    if (
      resetResult?.ok ||
      resetResult?.success ||
      resetResult?.status === true
    ) {
      return {
        success: true,
        message: resetResult?.message || 'Reset email sent',
      } as ResetPasswordResult;
    }

    const msg = resetResult?.message || 'Failed to send reset email';
    return {
      success: false,
      message: msg,
      error: msg,
    } as ResetPasswordResult;
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
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json(
      {
        success: false,
        message,
        error: 'Failed to send reset email',
        details: message,
      },
      { status: 500 }
    );
  }
}
