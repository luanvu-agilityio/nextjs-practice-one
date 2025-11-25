/**
 * Effect-based profile update using Effect.gen syntax.
 *
 * Clean, modern Effect code that's easy to read and maintain.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Effect } from 'effect';
import { eq } from 'drizzle-orm';

// Auth
import { auth } from '@/lib/better-auth';

// DB
import { db } from '@/lib/db';

// Schema
import { user } from '@/lib/db/schema';

interface UpdateProfileResult {
  success: boolean;
  message: string;
  status?: number;
}

export async function POST(request: NextRequest) {
  // Effect returns plain data
  const program = Effect.gen(function* () {
    // Step 1: Get session
    const session = yield* Effect.promise(() =>
      auth.api.getSession({
        headers: request.headers,
      })
    );

    // Step 2: Validate session
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'Unauthorized',
        status: 401,
      } as UpdateProfileResult;
    }

    // Step 3: Parse and validate body
    const body = yield* Effect.promise(() => request.json());
    const { name, email } = body;

    if (!name) {
      return {
        success: false,
        message: 'Name is required',
        status: 400,
      } as UpdateProfileResult;
    }

    // Step 4: Check if email is unique (if changing email)
    if (email && email !== session.user.email) {
      const existingUser = yield* Effect.promise(() =>
        db.query.user.findFirst({
          where: eq(user.email, email),
        })
      );

      if (existingUser && existingUser.id !== session.user.id) {
        return {
          success: false,
          message: 'Email already in use',
          status: 400,
        } as UpdateProfileResult;
      }
    }

    // Step 5: Update user in database
    const updateData = {
      name,
      ...(email && email !== session.user.email ? { email } : {}),
      updatedAt: new Date(),
    };

    yield* Effect.promise(() =>
      Promise.resolve(
        db.update(user).set(updateData).where(eq(user.id, session.user.id))
      )
    );

    return {
      success: true,
      message: 'Profile updated successfully',
      status: 200,
    } as UpdateProfileResult;
  });

  try {
    // Run Effect and get plain result
    const result = (await Effect.runPromise(program)) as UpdateProfileResult;

    // Map to NextResponse at boundary
    const status = result.status || (result.success ? 200 : 400);
    return NextResponse.json(
      { success: result.success, message: result.message },
      { status }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ message }, { status: 500 });
  }
}
