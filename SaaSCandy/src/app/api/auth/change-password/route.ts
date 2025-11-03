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

// Libs
import { auth } from '@/lib/better-auth';

// DB
import { db } from '@/lib/db';

// DB Schema
import { account } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Find the credential account (email/password)

    const userAccounts = await db.query.account.findMany({
      where: eq(account.userId, session.user.id),
    });

    const credentialAccount = userAccounts.find(
      acc => acc.providerId === 'credential'
    );

    if (!credentialAccount || !credentialAccount.password) {
      return NextResponse.json(
        {
          message:
            'Password authentication not enabled. You may have signed in with Google/GitHub.',
        },
        { status: 400 }
      );
    }

    // Verify current password
    const isValid = await verify(credentialAccount.password, currentPassword);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword);

    // Log values before update
    const updateData = {
      password: hashedPassword,
      updatedAt: new Date(),
    };

    // Update password in database
    await db
      .update(account)
      .set(updateData)
      .where(eq(account.id, credentialAccount.id));

    return NextResponse.json({
      message: 'Password updated successfully',
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to change password',
      },
      { status: 500 }
    );
  }
}
