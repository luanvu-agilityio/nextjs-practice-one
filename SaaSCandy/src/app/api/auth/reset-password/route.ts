import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';
import { getFriendlyMessage } from '@/components';

/**
 * API route for resetting a user's password using a token.
 *
 * Better Auth handles:
 * - Token verification from verification table
 * - Password hashing (scrypt by default)
 * - Updating account.password (providerId='credential')
 * - Token cleanup
 * - Triggering onPasswordReset callback
 */
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { token, newPassword } = body ?? {};

    if (!token || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Token and new password required' },
        { status: 400 }
      );
    }

    const result = await auth.api.resetPassword({
      body: { token, newPassword },
    });

    interface ResetResult {
      user?: unknown;
      ok?: boolean;
      success?: boolean;
      status?: boolean | number;
      message?: string;
      error?: string;
      [key: string]: unknown;
    }

    const resetResult = result as ResetResult;

    if (
      resetResult?.user ||
      resetResult?.ok ||
      resetResult?.success ||
      resetResult?.status === true
    ) {
      return NextResponse.json({
        success: true,
        message: resetResult?.message || 'Password updated successfully',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          resetResult?.error ||
          resetResult?.message ||
          'Invalid or expired token',
      },
      { status: 400 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: getFriendlyMessage(err) || 'Failed to reset password',
      },
      { status: 500 }
    );
  }
};
