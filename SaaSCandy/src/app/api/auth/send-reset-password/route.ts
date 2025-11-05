import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { email } = body || {};

    console.log(
      '[send-reset-password] 🔐 Password reset request for email:',
      email
    );

    if (!email) {
      console.log('[send-reset-password] ❌ Missing email');
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    console.log(
      '[send-reset-password] ℹ️ Calling Better Auth requestPasswordReset API'
    );

    const result = await auth.api.requestPasswordReset({ body: { email } });

    interface ResetResult {
      ok?: boolean;
      success?: boolean;
      status?: boolean | number;
      message?: string;
      [key: string]: unknown;
    }

    function isResetResult(obj: unknown): obj is ResetResult {
      return (
        typeof obj === 'object' &&
        obj !== null &&
        ('ok' in obj || 'success' in obj || 'status' in obj || 'message' in obj)
      );
    }

    const resetResult: ResetResult = isResetResult(result)
      ? (result as ResetResult)
      : { message: typeof result === 'string' ? result : undefined };

    if (
      resetResult?.ok ||
      resetResult?.success ||
      resetResult?.status === true
    ) {
      console.log(
        '[send-reset-password] ✅ Reset email sent successfully to:',
        email
      );
      return NextResponse.json({
        success: true,
        message: resetResult?.message || 'Reset email sent',
      });
    }

    console.log(
      '[send-reset-password] ❌ Failed to send reset email:',
      resetResult?.message
    );

    return NextResponse.json({
      success: false,
      message: resetResult?.message || 'Failed to send reset email',
    });
  } catch (error: unknown) {
    console.error('[send-reset-password] ❌ Exception:', error);

    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email', details: msg },
      { status: 500 }
    );
  }
}
