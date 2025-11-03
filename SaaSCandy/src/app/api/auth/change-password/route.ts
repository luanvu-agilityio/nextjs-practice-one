/**
 * API route for changing the user's password.
 *
 * - Requires authentication (session).
 * - Validates current and new password.
 * - Verifies the current password using Argon2.
 * - Updates the password in the database after hashing.
 * - Returns success or error messages.
 *
 * Method: POST
 * Body: { currentPassword: string, newPassword: string }
 * Response: { success: boolean, message: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/better-auth';
import { db } from '@/lib/db';
import { account } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current and new password required' },
        { status: 400 }
      );
    }

    const userAccounts = await db.query.account.findMany({
      where: eq(account.userId, session.user.id),
    });
    const credentialAccount = userAccounts.find(
      acc => acc.providerId === 'credential'
    );

    if (!credentialAccount || !credentialAccount.password) {
      console.error(
        '[change-password] credential account missing or no password',
        { userId: session.user.id }
      );
      return NextResponse.json(
        { message: 'Password authentication not enabled for this account' },
        { status: 400 }
      );
    }

    // DEBUG: log a short preview of the stored hash (server logs only)
    console.log('[change-password] stored password preview', {
      userId: session.user.id,
      passwordPreview:
        typeof credentialAccount.password === 'string'
          ? credentialAccount.password.slice(0, 20) + '...'
          : String(credentialAccount.password),
    });

    // guard: ensure it's likely an argon2 hash string before calling verify
    if (
      typeof credentialAccount.password !== 'string' ||
      !credentialAccount.password.startsWith('$argon2')
    ) {
      console.error('[change-password] invalid hash format', {
        userId: session.user.id,
      });
      return NextResponse.json(
        {
          message:
            'Stored password hash is invalid or unsupported. Please contact support.',
        },
        { status: 500 }
      );
    }

    let isValid = false;
    try {
      isValid = await verify(credentialAccount.password, currentPassword);
    } catch (err) {
      console.error('[change-password] verify threw', err);
      return NextResponse.json(
        {
          message:
            'Invalid hashed password: ' +
            (err instanceof Error ? err.message : 'verify error'),
        },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(newPassword);
    await db
      .update(account)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(account.id, credentialAccount.id));

    return NextResponse.json({
      message: 'Password updated successfully',
      success: true,
    });
  } catch (error) {
    console.error('[change-password] error', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to change password',
      },
      { status: 500 }
    );
  }
}
