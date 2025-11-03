import { NextRequest, NextResponse } from 'next/server';
import { hash } from '@node-rs/argon2';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { user, account } from '@/lib/db/schema';

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

    // find user by reset token
    const foundUser = await db.query.user.findFirst({
      where: eq(user.resetToken, token),
    });

    if (!foundUser) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // token expiry check (defensive)
    const expiresDate = foundUser.resetTokenExpires
      ? new Date(foundUser.resetTokenExpires)
      : null;
    if (
      !expiresDate ||
      Number.isNaN(expiresDate.getTime()) ||
      Date.now() > expiresDate.getTime()
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // hash new password
    const hashed = await hash(newPassword);

    const updated = await db
      .update(account)
      .set({
        password: hashed,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(account.userId, foundUser.id),
          eq(account.providerId, 'credential')
        )
      );

    // clear reset token on user record as well
    await db
      .update(user)
      .set({
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, foundUser.id));

    console.log(
      '[reset-password] userId',
      foundUser.id,
      'account update result:',
      updated
    );

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (err: unknown) {
    console.error('[reset-password] error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
};
