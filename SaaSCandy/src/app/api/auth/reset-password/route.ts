import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';

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

    console.log('[reset-password] 🔐 Password reset request received');
    console.log(
      '[reset-password] Token (first 10 chars):',
      token?.substring(0, 10) + '...'
    );

    if (!token || !newPassword || typeof newPassword !== 'string') {
      console.log('[reset-password] ❌ Missing required fields');
      return NextResponse.json(
        { success: false, message: 'Token and new password required' },
        { status: 400 }
      );
    }

    console.log('[reset-password] ℹ️ Calling Better Auth resetPassword API');

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
      console.log('[reset-password] ✅ Password reset successful');
      console.log(
        '[reset-password] ℹ️ Better Auth handled all updates and notifications'
      );

      return NextResponse.json({
        success: true,
        message: resetResult?.message || 'Password updated successfully',
      });
    }

    console.log(
      '[reset-password] ❌ Reset failed:',
      resetResult?.error || resetResult?.message
    );

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
    console.error('[reset-password] ❌ Exception:', err);

    return NextResponse.json(
      { success: false, message: 'Failed to reset password' },
      { status: 500 }
    );
  }
};
