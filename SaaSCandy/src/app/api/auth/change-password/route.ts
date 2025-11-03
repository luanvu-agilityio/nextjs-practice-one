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
import { auth } from '@/lib/better-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body ?? {};

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Current password and new password are required',
        },
        { status: 400 }
      );
    }

    const result = (await auth.api.changePassword({
      headers: request.headers,
      body: { currentPassword, newPassword },
    })) as unknown;

    type ChangePasswordResponse = {
      user?: unknown;
      token?: string;
      ok?: boolean;
      message?: string;
      error?: string;
      [key: string]: unknown;
    };

    const authResult = result as ChangePasswordResponse;

    if (authResult?.user || authResult?.token || authResult?.ok) {
      return NextResponse.json({
        success: true,
        message:
          typeof authResult.message === 'string'
            ? authResult.message
            : 'Password changed',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          (typeof authResult.error === 'string'
            ? authResult.error
            : undefined) ||
          (typeof authResult.message === 'string'
            ? authResult.message
            : undefined) ||
          'Failed to change password',
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to change password',
      },
      { status: 500 }
    );
  }
}
