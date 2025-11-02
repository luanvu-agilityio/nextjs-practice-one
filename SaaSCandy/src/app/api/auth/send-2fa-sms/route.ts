/**
 * API route for sending and verifying SMS 2FA codes during sign-in.
 *
 * - Stores codes in Neon Postgres via Drizzle ORM.
 * - Sends SMS via Twilio.
 * - Supports POST (send code) and PUT (verify code).
 */
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import * as schema from '@/lib/db/schema';
import { auth } from '@/lib/better-auth';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    console.log('[send-2fa-sms] POST body:', body);
    const { phone, email, password } = body || {};
    if (!phone) {
      return NextResponse.json({ error: 'Phone required' }, { status: 400 });
    }
    // Optionally validate user credentials
    let user = null;
    if (email && password) {
      const signInResult = await auth.api.signInEmail({
        body: { email, password },
      });
      if (!signInResult?.user) {
        return NextResponse.json(
          { success: false, error: 'Invalid credentials' },
          { status: 401 }
        );
      }
      user = signInResult.user;
    } else {
      // Find user by phone
      const users = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.twoFactorEnabled, true));
      user = users.find(u => u.phone === phone);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }
    // Generate code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    // Delete any existing codes for this user/phone
    await db
      .delete(schema.smsVerificationCode)
      .where(eq(schema.smsVerificationCode.userId, user.id));
    // Store code
    await db.insert(schema.smsVerificationCode).values({
      id: crypto.randomUUID(),
      userId: user.id,
      phone,
      code,
      expiresAt,
      verified: false,
      attempts: '0',
    });
    // Send SMS
    try {
      if (!accountSid || !authToken || !fromPhone) {
        console.error('[send-2fa-sms] Missing Twilio env vars', {
          accountSid: !!accountSid,
          authToken: !!authToken,
          fromPhone: !!fromPhone,
        });
        return NextResponse.json(
          { success: false, error: 'Twilio configuration missing' },
          { status: 500 }
        );
      }

      await client.messages.create({
        body: `Your SaaSCandy verification code is: ${code}`,
        from: fromPhone,
        to: phone,
      });
    } catch (smsError) {
      // Log Twilio error for debugging
      console.error('[send-2fa-sms] Twilio send failed:', smsError);
      // If Twilio provides a message, surface it in the response to help debugging (dev only)
      const smsErrorMessage =
        smsError && typeof smsError === 'object' && 'message' in smsError
          ? (smsError as any).message
          : String(smsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send SMS',
          details: smsErrorMessage,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true, message: 'SMS code sent' });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;
    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone and code required' },
        { status: 400 }
      );
    }
    // Find code entry
    const entries = await db
      .select()
      .from(schema.smsVerificationCode)
      .where(eq(schema.smsVerificationCode.phone, phone));
    const entry = entries[0];
    if (!entry || entry.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Code expired' },
        { status: 400 }
      );
    }
    if (entry.code !== code) {
      // Optionally increment attempts
      await db
        .update(schema.smsVerificationCode)
        .set({ attempts: String(Number(entry.attempts || '0') + 1) })
        .where(eq(schema.smsVerificationCode.id, entry.id));
      return NextResponse.json(
        { success: false, error: 'Invalid code' },
        { status: 401 }
      );
    }
    // Mark as verified and delete code
    await db
      .delete(schema.smsVerificationCode)
      .where(eq(schema.smsVerificationCode.id, entry.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
