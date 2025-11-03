import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';

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

    type ResetPasswordResult = {
      ok?: boolean;
      success?: boolean;
      user?: unknown;
      message?: string;
      error?: string;
    };

    function isResetPasswordResult(obj: unknown): obj is ResetPasswordResult {
      if (typeof obj !== 'object' || obj === null) return false;
      const o = obj as Record<string, unknown>;
      return (
        'ok' in o ||
        'success' in o ||
        'user' in o ||
        'message' in o ||
        'error' in o
      );
    }

    const resetPasswordResult: ResetPasswordResult = isResetPasswordResult(
      result
    )
      ? result
      : { error: 'Unexpected response shape' };
    if (
      resetPasswordResult?.ok ||
      resetPasswordResult?.success ||
      resetPasswordResult?.user
    ) {
      return NextResponse.json({
        success: true,
        message: resetPasswordResult?.message || 'Password updated',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          resetPasswordResult?.error ||
          resetPasswordResult?.message ||
          'Failed to reset password',
      },
      { status: 400 }
    );
  } catch (err: unknown) {
    console.error('[reset-password] error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
};
