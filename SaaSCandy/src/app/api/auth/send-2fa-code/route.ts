/**
 * API route for sending a 2FA code to the user's email during sign-in.
 *
 * - Validates email and password.
 * - Uses Better Auth to check credentials.
 * - Generates and stores a 6-digit code with expiration.
 * - Sends the code via email using Resend.
 * - Returns success or error messages.
 *
 * Method: POST
 * Body: { email: string, password: string }
 * Response: { success: boolean, message: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import sgMail from '@sendgrid/mail';
import { eq } from 'drizzle-orm';

// DB
import { db } from '@/lib/db';

// Schema
import * as schema from '@/lib/db/schema';

// Constants
import { TwoFactorEmail } from '@/constants/email-template';

// Auth
import { auth } from '@/lib/better-auth';

// Config
import { getConfig } from '@/lib/config';

// Generate random 6-digit code
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Handles the POST request for sending 2FA code.
 * Exported for testing purposes.
 */
export async function handleSend2FACode(
  request: NextRequest,
  config: { SENDGRID_API_KEY?: string; SENDGRID_FROM_EMAIL?: string }
) {
  // Initialize SendGrid if API key is provided
  if (config.SENDGRID_API_KEY) {
    sgMail.setApiKey(config.SENDGRID_API_KEY);
  }

  const program = Effect.gen(function* () {
    const body = yield* Effect.promise(() => request.json());
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const signInResult = yield* Effect.promise(() =>
      auth.api.signInEmail({ body: { email, password } })
    );

    // If sign-in fails, return error response
    if (!signInResult?.user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // If successful, proceed with sending 2FA code
    const user = signInResult.user;

    // Generate 6-digit code
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unverified codes for this user
    yield* Effect.promise(() =>
      db
        .delete(schema.emailVerificationCode)
        .where(eq(schema.emailVerificationCode.userId, user.id))
    );

    // Store code in separate table (human-readable)
    yield* Effect.promise(() =>
      db.insert(schema.emailVerificationCode).values({
        id: crypto.randomUUID(),
        userId: user.id,
        email: user.email,
        code,
        tempPassword: password, // DEMO ONLY - store plain password
        expiresAt,
        verified: false,
        attempts: '0',
      })
    );

    // Send email with code
    yield* Effect.promise(() =>
      sgMail.send({
        from: config.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        to: email,
        subject: 'Your SaaSCandy Login Code',
        html: TwoFactorEmail({ code, userName: user.name || 'User' }),
      })
    );

    return NextResponse.json({
      success: true,
      message: 'Login code sent to your email',
    });
  });

  try {
    return await Effect.runPromise(program);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// Load configuration and export POST handler
export async function POST(request: NextRequest) {
  const cfg = await getConfig();
  return handleSend2FACode(request, cfg);
}
