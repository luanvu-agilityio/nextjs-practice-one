import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { email } = body || {};
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

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

    const anyResult: ResetResult = isResetResult(result)
      ? result
      : { message: typeof result === 'string' ? result : undefined };

    if (anyResult?.ok || anyResult?.success || anyResult?.status === true) {
      return NextResponse.json({
        success: true,
        message: anyResult?.message || 'Reset email sent',
      });
    }

    return NextResponse.json({
      success: true,
      message: anyResult?.message || 'Reset email sent',
    });
  } catch (error: unknown) {
    console.error('[send-reset-password] error', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email', details: msg },
      { status: 500 }
    );
  }
}
