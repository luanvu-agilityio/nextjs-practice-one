// Effect
import { Effect, pipe, Schedule, Option } from 'effect';

// Client HTTP
import { http } from '@/service/HttpClient';

// Constants
import { API_ROUTES } from '@/constants';

// Helpers
import { runAuthEffect } from './helpers';

// Errors
import { makeValidationError, makeAuthError } from '@/lib/errors';
import type { AppError } from '@/lib/errors';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Verify2FAResponse {
  email: string;
  password: string;
}

export interface Send2FAResponse {
  message: string;
}

// =============================================================================
// INPUT VALIDATION EFFECTS
// =============================================================================

/**
 * Validates email format
 * @returns Effect that succeeds with the email or fails with ValidationError
 */
const validateEmail = (
  email: string
): Effect.Effect<string, AppError, never> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
    ? Effect.succeed(email)
    : Effect.fail(
        makeValidationError([
          { path: 'email', message: 'Invalid email format' },
        ])
      );
};

/**
 * Validates password strength (min 6 characters)
 * @returns Effect that succeeds with the password or fails with ValidationError
 */
const validatePassword = (
  password: string
): Effect.Effect<string, AppError, never> => {
  return password.length >= 6
    ? Effect.succeed(password)
    : Effect.fail(
        makeValidationError([
          {
            path: 'password',
            message: 'Password must be at least 6 characters',
          },
        ])
      );
};

/**
 * Validates 2FA code format (6 digits)
 * @returns Effect that succeeds with the code or fails with ValidationError
 */
const validate2FACode = (
  code: string
): Effect.Effect<string, AppError, never> => {
  const codeRegex = /^\d{6}$/;
  return codeRegex.test(code)
    ? Effect.succeed(code)
    : Effect.fail(
        makeValidationError([
          { path: 'code', message: 'Code must be 6 digits' },
        ])
      );
};

/**
 * Validates token is not empty
 * @returns Effect that succeeds with the token or fails with ValidationError
 */
const validateToken = (
  token: string
): Effect.Effect<string, AppError, never> => {
  return token && token.trim().length > 0
    ? Effect.succeed(token)
    : Effect.fail(
        makeValidationError([{ path: 'token', message: 'Token is required' }])
      );
};

// =============================================================================
// EFFECT-BASED AUTH SERVICES WITH VALIDATION & COMPOSITION
// =============================================================================
// Note: These Effects use validation, retry logic, and proper error channels.
// HttpClient already returns typed Effects with error handling.

/**
 * Send 2FA verification code to user's email
 *
 * Validates input, retries on transient failures, and returns typed errors.
 *
 * @example
 * ```typescript
 * import { send2FACode } from '@/service/AuthService';
 * import { runAuthEffect } from '@/service/AuthService/helpers';
 *
 * const result = await runAuthEffect(send2FACode('user@example.com', 'password123'));
 * if (result.success) {
 *   console.log('Code sent:', result.data);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 * ```
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Effect that resolves to ApiResponse with Send2FAResponse data
 */
export const send2FACode = (email: string, password: string) =>
  pipe(
    Effect.all([validateEmail(email), validatePassword(password)]),
    Effect.flatMap(([validEmail, validPassword]) =>
      http.post<ApiResponse<Send2FAResponse>>(API_ROUTES.AUTH.SEND_2FA_CODE, {
        email: validEmail,
        password: validPassword,
      })
    ),
    // Retry transient failures (network issues, 5xx errors)
    Effect.retry({ times: 2, schedule: Schedule.exponential('100 millis') }),
    Effect.catchAll(error => {
      // Re-throw AppError types (validation, auth errors)
      if (error && typeof error === 'object' && '_tag' in error) {
        return Effect.fail(error as AppError);
      }
      // Convert unknown errors to AuthError
      return Effect.fail(
        makeAuthError(
          'Other',
          error instanceof Error ? error.message : 'Failed to send 2FA code'
        )
      );
    })
  );

/**
 * Verify 2FA code from email
 *
 * Validates email and code format before making the API request.
 *
 * @example
 * ```typescript
 * const result = await runAuthEffect(verify2FACode('user@example.com', '123456'));
 * if (result.success) {
 *   const { email, password } = result.data;
 *   // Proceed with sign-in
 * }
 * ```
 *
 * @param email - User's email address
 * @param code - 6-digit verification code
 * @returns Effect that resolves to ApiResponse with credentials
 */
export const verify2FACode = (email: string, code: string) =>
  pipe(
    Effect.all([validateEmail(email), validate2FACode(code)]),
    Effect.flatMap(([validEmail, validCode]) =>
      http.post<ApiResponse<Verify2FAResponse>>(
        API_ROUTES.AUTH.VERIFY_2FA_CODE,
        {
          email: validEmail,
          code: validCode,
        }
      )
    ),
    Effect.catchAll(error => {
      if (error && typeof error === 'object' && '_tag' in error) {
        return Effect.fail(error as AppError);
      }
      return Effect.fail(
        makeAuthError(
          'Other',
          error instanceof Error ? error.message : 'Failed to verify code'
        )
      );
    })
  );

/**
 * Change user password
 *
 * Validates both passwords before making the request.
 * Requires user to be authenticated (session token in HttpClient).
 *
 * @example
 * ```typescript
 * const result = await runAuthEffect(changePassword('oldpass', 'newpass123'));
 * if (result.success) {
 *   console.log('Password changed successfully');
 * }
 * ```
 *
 * @param currentPassword - User's current password
 * @param newPassword - New password (min 6 characters)
 * @returns Effect that resolves to ApiResponse
 */
export const changePassword = (currentPassword: string, newPassword: string) =>
  pipe(
    Effect.all([
      validatePassword(currentPassword),
      validatePassword(newPassword),
    ]),
    Effect.flatMap(([current, newPass]) =>
      Effect.gen(function* () {
        // Additional validation: passwords must be different
        if (current === newPass) {
          yield* Effect.fail(
            makeValidationError([
              {
                path: 'newPassword',
                message: 'New password must be different from current password',
              },
            ])
          );
        }
        return yield* http.post<ApiResponse>(API_ROUTES.AUTH.CHANGE_PASSWORD, {
          currentPassword: current,
          newPassword: newPass,
        });
      })
    ),
    Effect.catchAll(error => {
      // If it's already an AppError (ValidationError, AuthError, etc.), re-throw it
      if (error && typeof error === 'object' && '_tag' in error) {
        return Effect.fail(error as AppError);
      }
      // Otherwise wrap in AuthError
      return Effect.fail(
        makeAuthError(
          'Other',
          error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof error.message === 'string'
            ? error.message
            : 'Failed to change password'
        )
      );
    })
  );

/**
 * Update user profile
 *
 * Validates email if provided. At least one field (name or email) must be provided.
 *
 * @example
 * ```typescript
 * const result = await runAuthEffect(updateProfile({ name: 'John Doe', email: 'john@example.com' }));
 * ```
 *
 * @param data - Profile data to update (name and/or email)
 * @returns Effect that resolves to ApiResponse
 */
export const updateProfile = (data: { name?: string; email?: string }) => {
  // Validate at least one field is provided
  if (!data.name && !data.email) {
    return Effect.fail(
      makeValidationError([
        {
          path: 'profile',
          message: 'At least one field (name or email) is required',
        },
      ])
    );
  }

  // If email is provided, validate it first, otherwise skip validation
  if (data.email) {
    return pipe(
      validateEmail(data.email),
      Effect.flatMap(validEmail =>
        http.post<ApiResponse>(API_ROUTES.AUTH.UPDATE_PROFILE, {
          ...data,
          email: validEmail,
        })
      ),
      Effect.catchAll(error => {
        if (error && typeof error === 'object' && '_tag' in error) {
          return Effect.fail(error as AppError);
        }
        return Effect.fail(
          makeAuthError(
            'Other',
            error instanceof Error ? error.message : 'Failed to update profile'
          )
        );
      })
    );
  }

  // No email to validate, just send the request
  return pipe(
    http.post<ApiResponse>(API_ROUTES.AUTH.UPDATE_PROFILE, data),
    Effect.catchAll(error => {
      if (error && typeof error === 'object' && '_tag' in error) {
        return Effect.fail(error as AppError);
      }
      return Effect.fail(
        makeAuthError(
          'Other',
          error instanceof Error ? error.message : 'Failed to update profile'
        )
      );
    })
  );
};

/**
 * Verify email with token
 *
 * Validates token format and adds timeout to prevent hanging requests.
 *
 * @example
 * ```typescript
 * const result = await runAuthEffect(verifyEmail('abc-123-def-456'));
 * if (result.success) {
 *   console.log('Email verified successfully');
 * }
 * ```
 *
 * @param token - Email verification token
 * @returns Effect that resolves to ApiResponse
 */
export const verifyEmail = (token: string) =>
  pipe(
    validateToken(token),
    Effect.flatMap(validToken =>
      http.get<ApiResponse>(
        `${API_ROUTES.AUTH.VERIFY_EMAIL}?token=${validToken}`
      )
    ),
    // Add timeout to prevent hanging on slow connections (throws TimeoutException)
    Effect.timeout('10 seconds'),
    Effect.catchAll(error => {
      if (error && typeof error === 'object' && '_tag' in error) {
        // Check if it's a timeout error
        if ('_tag' in error && error._tag === 'TimeoutException') {
          return Effect.fail(
            makeAuthError('Other', 'Email verification request timed out')
          );
        }
        return Effect.fail(error as AppError);
      }
      return Effect.fail(
        makeAuthError(
          'Other',
          error instanceof Error ? error.message : 'Failed to verify email'
        )
      );
    })
  );

/**
 * Request a password reset email (generate token + send email)
 *
 * Validates email and retries on transient failures (network issues).
 *
 * @example
 * ```typescript
 * const result = await runAuthEffect(requestPasswordReset('user@example.com'));
 * if (result.success) {
 *   console.log('Reset email sent');
 * }
 * ```
 *
 * @param email - User's email address
 * @returns Effect that resolves to ApiResponse
 */
export const requestPasswordReset = (email: string) =>
  pipe(
    validateEmail(email),
    Effect.flatMap(validEmail =>
      http.post<ApiResponse>(API_ROUTES.AUTH.SEND_RESET_PASSWORD, {
        email: validEmail,
      })
    ),
    // Retry on transient failures (email sending can be flaky)
    Effect.retry({ times: 2, schedule: Schedule.exponential('200 millis') }),
    Effect.catchAll(error => {
      if (error && typeof error === 'object' && '_tag' in error) {
        return Effect.fail(error as AppError);
      }
      return Effect.fail(
        makeAuthError(
          'Other',
          error instanceof Error
            ? error.message
            : 'Failed to request password reset'
        )
      );
    })
  );

/**
 * Reset password using token
 *
 * Validates token and password before submitting.
 *
 * @example
 * ```typescript
 * const result = await runAuthEffect(resetPassword('reset-token-123', 'newpass123'));
 * if (result.success) {
 *   console.log('Password reset successful');
 * }
 * ```
 *
 * @param token - Password reset token from email
 * @param newPassword - New password (min 6 characters)
 * @returns Effect that resolves to ApiResponse
 */
export const resetPassword = (token: string, newPassword: string) =>
  pipe(
    Effect.all([validateToken(token), validatePassword(newPassword)]),
    Effect.flatMap(([validToken, validPassword]) =>
      http.post<ApiResponse>(API_ROUTES.AUTH.RESET_PASSWORD, {
        token: validToken,
        newPassword: validPassword,
      })
    ),
    Effect.catchAll(error => {
      if (error && typeof error === 'object' && '_tag' in error) {
        return Effect.fail(error as AppError);
      }
      return Effect.fail(
        makeAuthError(
          'Other',
          error instanceof Error ? error.message : 'Failed to reset password'
        )
      );
    })
  );

/**
 * Backward-compatible `apiRequest` helper used by some tests.
 * Performs a fetch and returns an `ApiResponse` object instead of throwing.
 */
export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<ApiResponse> {
  try {
    const res = await fetch(url, options as RequestInit);
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      return {
        success: true,
        data: data?.data ?? data,
        message: data?.message,
      };
    }

    const errMsg =
      data?.message || data?.error || res.statusText || 'Request failed';
    return { success: false, error: errMsg };
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errMsg };
  }
}

// =============================================================================
// BACKWARD COMPATIBLE PROMISE-BASED API (optional, for gradual migration)
// =============================================================================

/**
 * @deprecated Use the Effect-based `send2FACode` and `runAuthEffect` instead
 * This is kept for backward compatibility during migration.
 */
export const send2FACodeAsync = (email: string, password: string) =>
  runAuthEffect(send2FACode(email, password));

/**
 * @deprecated Use the Effect-based `verify2FACode` and `runAuthEffect` instead
 */
export const verify2FACodeAsync = (email: string, code: string) =>
  runAuthEffect(verify2FACode(email, code));

/**
 * @deprecated Use the Effect-based `changePassword` and `runAuthEffect` instead
 */
export const changePasswordAsync = (
  currentPassword: string,
  newPassword: string
) => runAuthEffect(changePassword(currentPassword, newPassword));

/**
 * @deprecated Use the Effect-based `updateProfile` and `runAuthEffect` instead
 */
export const updateProfileAsync = (data: { name?: string; email?: string }) =>
  runAuthEffect(updateProfile(data));

/**
 * @deprecated Use the Effect-based `verifyEmail` and `runAuthEffect` instead
 */
export const verifyEmailAsync = (token: string) =>
  runAuthEffect(verifyEmail(token));

/**
 * @deprecated Use the Effect-based `requestPasswordReset` and `runAuthEffect` instead
 */
export const requestPasswordResetAsync = (email: string) =>
  runAuthEffect(requestPasswordReset(email));

/**
 * @deprecated Use the Effect-based `resetPassword` and `runAuthEffect` instead
 */
export const resetPasswordAsync = (token: string, newPassword: string) =>
  runAuthEffect(resetPassword(token, newPassword));
