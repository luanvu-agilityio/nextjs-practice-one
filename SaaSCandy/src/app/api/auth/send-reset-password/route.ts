import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';
import { ResetPasswordEmail } from '@/constants/email-template';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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

    // Find user by email
    const users = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, email));
    const user = users[0];
    if (!user) {
      // Do not reveal user existence - return success to avoid enumeration
      return NextResponse.json({ success: true });
    }

    // Generate reset token and expiry (1 hour)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Persist token on user
    await db
      .update(schema.user)
      .set({ resetToken: token, resetTokenExpires: expiresAt })
      .where(eq(schema.user.id, user.id));

    // Build reset URL
    const resetUrl = `${process.env.BETTER_AUTH_URL || ''}/reset-password?token=${token}`;

    // Send email using SendGrid
    await sgMail.send({
      from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
      to: email,
      subject: 'Reset your password - SaaSCandy',
      html: ResetPasswordEmail({ resetUrl }),
    });

    return NextResponse.json({ success: true, message: 'Reset email sent' });
  } catch (error: unknown) {
    console.error('[send-reset-password] error', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: 'Failed to send reset email', details: msg },
      { status: 500 }
    );
  }
}
