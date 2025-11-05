import argon2 from 'argon2';
import { db, user as userTable, account as accountTable } from '@/lib/db';
import { isNotNull, and, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

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

    const candidates = await db
      .select()
      .from(userTable)
      .where(
        and(
          isNotNull(userTable.resetToken),
          isNotNull(userTable.resetTokenExpires)
        )
      )
      .limit(50)
      .execute();

    let matchedUser: (typeof candidates)[number] | null = null;
    for (const u of candidates) {
      if (!u.resetToken || !u.resetTokenExpires) continue;
      if (new Date(u.resetTokenExpires) < new Date()) continue;
      try {
        if (await argon2.verify(u.resetToken, token)) {
          matchedUser = u;
          break;
        }
      } catch {
        // ignore malformed hash
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    const passwordHash = await argon2.hash(newPassword);

    await db
      .update(userTable)
      .set({
        password: passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(userTable.id, matchedUser.id))
      .execute();

    // Also update the Better Auth credential record (account table) so
    // sign-in uses the new password. Better Auth verifies credentials
    // from the `account` table with providerId = 'credential'.
    try {
      await db
        .update(accountTable)
        .set({ password: passwordHash })
        .where(
          and(
            eq(accountTable.userId, matchedUser.id),
            eq(accountTable.providerId, 'credential')
          )
        )
        .execute();
    } catch (e) {
      // Log and continue — we don't want to leak details to the client.
      try {
        const { error: logError } = await import('@/lib/logger');
        logError('[reset-password] failed updating account table', e);
      } catch {
        /* noop */
      }
    }

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (err: unknown) {
    try {
      const { error: logError } = await import('@/lib/logger');
      logError('[reset-password] error', err);
    } catch {
      /* noop */
    }

    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
};
