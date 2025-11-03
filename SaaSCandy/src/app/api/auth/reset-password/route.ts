import { NextRequest, NextResponse } from 'next/server';
import { hash } from '@node-rs/argon2';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { user } from '@/lib/db/schema';

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

    // fetch user by token
    const foundUser = await db.query.user.findFirst({
      where: eq(user.resetToken, token),
    });

    if (!foundUser) {
      console.warn('[reset-password] token not found', { token });
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // normalize expires value and compare safely
    const expiresRaw = foundUser.resetTokenExpires;
    const expiresDate = expiresRaw ? new Date(expiresRaw) : null;

    if (
      !expiresDate ||
      Number.isNaN(expiresDate.getTime()) ||
      Date.now() > expiresDate.getTime()
    ) {
      console.warn('[reset-password] token expired', {
        userId: foundUser.id,
        expiresRaw,
      });
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // hash new password
    const hashedPassword = await hash(newPassword);

    // perform update
    await db
      .update(user)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, foundUser.id));

    // re-query user to confirm update
    const updatedUser = await db.query.user.findFirst({
      where: eq(user.id, foundUser.id),
    });

    if (!updatedUser) {
      console.error('[reset-password] failed to re-fetch user after update', {
        userId: foundUser.id,
      });
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      );
    }

    // ensure password hash actually changed
    if (updatedUser.password === foundUser.password) {
      console.error('[reset-password] password hash unchanged after update', {
        userId: foundUser.id,
      });
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (err: unknown) {
    console.error('[reset-password] error', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
};
