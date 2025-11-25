import { eq } from 'drizzle-orm';

// DB
import { db } from './db';

// Schema
import * as schema from './db/schema';

/**
 * Create and store an SMS OTP for a user.
 * Returns the generated code and expiresAt.
 */
export async function createSmsOtp(userId: string, phone: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Remove any existing codes for the user
  await db
    .delete(schema.smsVerificationCode)
    .where(eq(schema.smsVerificationCode.userId, userId));

  await db.insert(schema.smsVerificationCode).values({
    id: crypto.randomUUID(),
    userId,
    phone,
    code,
    expiresAt,
    verified: false,
    attempts: '0',
  });

  return { code, expiresAt };
}
