/**
 * API route for updating the user's profile information.
 *
 * - Requires authentication (session).
 * - Validates and updates name and email.
 * - Checks for email uniqueness before updating.
 * - Updates the user record in the database.
 * - Returns success or error messages.
 *
 * Method: POST
 * Body: { name: string, email?: string }
 * Response: { success: boolean, message: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

// Libs
import { auth } from '@/lib/better-auth';

// DB
import { db } from '@/lib/db';

// DB Schema
import { user } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if email is changing and if it's already taken
    if (email && email !== session.user.email) {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData = {
      name,
      ...(email && email !== session.user.email ? { email } : {}),
      updatedAt: new Date(),
    };

    // Update user in Better Auth database
    await db.update(user).set(updateData).where(eq(user.id, session.user.id));

    return NextResponse.json({
      message: 'Profile updated successfully',
      success: true,
    });
  } catch (error) {
    console.error('[update-profile] Error:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}
