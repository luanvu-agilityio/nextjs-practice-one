/**
 * Effect-based API route using Effect.gen syntax.
 *
 * Effect.gen provides clean, modern syntax similar to async/await,
 * with built-in error handling, retries, and composition.
 *
 * Method: POST
 * Body: { currentPassword: string, newPassword: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import { auth } from '@/lib/better-auth';

interface ChangePasswordResult {
  success: boolean;
  message: string;
  status?: number;
}

export async function POST(request: NextRequest) {
  // Effect returns plain data
  const program = Effect.gen(function* () {
    // Step 1: Parse request body
    const body = yield* Effect.promise(() => request.json());
    const { currentPassword, newPassword } = body ?? {};

    // Step 2: Validate inputs
    if (!currentPassword || !newPassword) {
      return {
        success: false,
        message: 'Current password and new password are required',
        status: 400,
      } as ChangePasswordResult;
    }

    // Step 3: Call Better Auth API
    const result = yield* Effect.promise(() =>
      auth.api.changePassword({
        headers: request.headers,
        body: { currentPassword, newPassword },
      })
    );

    type ChangePasswordResponse = {
      user?: unknown;
      token?: string;
      ok?: boolean;
      message?: string;
      error?: string;
    };

    const authResult = result as ChangePasswordResponse;

    // Step 4: Check for success
    if (authResult?.user || authResult?.token || authResult?.ok) {
      return {
        success: true,
        message:
          typeof authResult.message === 'string'
            ? authResult.message
            : 'Password changed successfully',
        status: 200,
      } as ChangePasswordResult;
    }

    // Step 5: Handle Better Auth errors
    const errorMessage =
      (typeof authResult.error === 'string' ? authResult.error : undefined) ||
      (typeof authResult.message === 'string'
        ? authResult.message
        : undefined) ||
      'Failed to change password';

    return {
      success: false,
      message: errorMessage,
      status: 400,
    } as ChangePasswordResult;
  });

  try {
    // Run Effect and get plain result
    const result = (await Effect.runPromise(program)) as ChangePasswordResult;

    // Map to NextResponse at boundary
    const status = result.status || (result.success ? 200 : 400);
    return NextResponse.json(
      { success: result.success, message: result.message },
      { status }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
