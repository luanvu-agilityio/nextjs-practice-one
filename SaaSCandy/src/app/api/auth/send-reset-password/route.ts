import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { ResetPasswordEmail } from '@/constants/email-template';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { user } from '@/lib/db/schema';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const POST = async (request: NextRequest) => {
  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  const foundUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });
  if (!foundUser) {
    return NextResponse.json({ message: 'Email not found' }, { status: 404 });
  }

  const token = crypto.randomUUID();
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await db
    .update(user)
    .set({
      resetToken: token,
      resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
    })
    .where(eq(user.id, foundUser.id));

  await sgMail.send({
    from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
    to: email,
    subject: 'Reset your password - SaaSCandy',
    html: ResetPasswordEmail({ resetUrl }),
  });

  return NextResponse.json({ success: true, message: 'Reset email sent' });
};
