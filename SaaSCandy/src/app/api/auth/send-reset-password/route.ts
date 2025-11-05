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

    const resetResult: ResetResult = isResetResult(result)
      ? (result as ResetResult)
      : { message: typeof result === 'string' ? result : undefined };

    if (
      resetResult?.ok ||
      resetResult?.success ||
      resetResult?.status === true
    ) {
      return NextResponse.json({
        success: true,
        message: resetResult?.message || 'Reset email sent',
      });
    }

    return NextResponse.json({
      success: false,
      message: resetResult?.message || 'Failed to send reset email',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email', details: msg },
      { status: 500 }
    );
  }
}
