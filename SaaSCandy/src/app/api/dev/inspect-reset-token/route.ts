import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { user, account } from '@/lib/db/schema';

// Dev-only endpoint to inspect reset tokens and related account records.
// WARNING: Only enable/run locally. This endpoint intentionally exposes
// sensitive previews and must NOT be deployed to production.
export async function GET(request: NextRequest) {
  try {
    // Block in production just in case
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Not allowed in production' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const token = url.searchParams.get('token') ?? '';

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'token query required' },
        { status: 400 }
      );
    }

    const foundUser = await db.query.user.findFirst({
      where: eq(user.resetToken, token),
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: 'Token not found' },
        { status: 404 }
      );
    }

    const accounts = await db.query.account.findMany({
      where: eq(account.userId, foundUser.id),
    });

    // Return a safe preview: show id, email, resetTokenExpires, and account provider/password preview
    const accountPreview = accounts.map(a => ({
      id: a.id,
      providerId: a.providerId,
      passwordPreview: String(a.password).slice(0, 120),
    }));

    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        resetToken: foundUser.resetToken
          ? String(foundUser.resetToken).slice(0, 120)
          : null,
        resetTokenExpires: foundUser.resetTokenExpires,
      },
      accounts: accountPreview,
    });
  } catch (err: unknown) {
    console.error('[dev/inspect-reset-token] error', err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
