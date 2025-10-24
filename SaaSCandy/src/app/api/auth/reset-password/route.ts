import { NextRequest, NextResponse } from 'next/server';
import { hash } from '@node-rs/argon2';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { user } from '@/lib/db/schema';

export const POST = async (request: NextRequest) => {
  const { token, newPassword } = await request.json();
  if (!token || !newPassword) {
    return NextResponse.json(
      { message: 'Token and new password required' },
      { status: 400 }
    );
  }

  const foundUser = await db.query.user.findFirst({
    where: eq(user.resetToken, token),
  });
  if (
    !foundUser ||
    !foundUser.resetTokenExpires ||
    new Date() > foundUser.resetTokenExpires
  ) {
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 400 }
    );
  }

  const hashedPassword = await hash(newPassword);

  await db
    .update(user)
    .set({
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, foundUser.id));

  return NextResponse.json({ success: true, message: 'Password updated' });
};
