/**
 * Centralized Effect error handling and conversion utilities.
 *
 * This module provides standardized helpers for:
 * - Converting Effect errors to AppError ADTs
 * - Running Effects and mapping results to ApiResponse or typed results
 * - Extracting friendly error messages for UI display
 *
 * Usage:
 * - Use `convertEffectError` to normalize any Effect error to AppError
 * - Use `runEffectToApiResponse` to run an Effect and get an ApiResponse
 * - Use `runEffectSafely` for UI components that need ok/error results
 */

import { Effect } from 'effect';
import type { Effect as EffectType } from 'effect/Effect';
import { AppError, makeHttpError, makeExternalServiceError } from './errors';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type RunResult<A> =
  | { ok: true; value: A }
  | { ok: false; error: unknown; message: string };

/**
 * Type guard to check if an object has a specific property
 */
function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return obj !== null && typeof obj === 'object' && key in obj;
}

/**
 * Type guard to check if an error is already an AppError ADT
 */
function isAppError(err: unknown): err is AppError {
  if (!hasProperty(err, '_tag')) return false;
  const tag = err._tag;
  return (
    tag === 'HttpError' ||
    tag === 'AuthError' ||
    tag === 'ValidationError' ||
    tag === 'ExternalServiceError' ||
    tag === 'NotFoundError'
  );
}

/**
 * Extract error message safely from various error shapes
 */
function extractErrorMessage(err: unknown): string {
  // Error object
  if (err instanceof Error) {
    return err.message;
  }

  // Object with message property
  if (hasProperty(err, 'message')) {
    const msg = err.message;
    if (typeof msg === 'string') return msg;
  }

  // Object with error property
  if (hasProperty(err, 'error')) {
    const errMsg = err.error;
    if (typeof errMsg === 'string') return errMsg;
    if (errMsg instanceof Error) return errMsg.message;
  }

  // String error
  if (typeof err === 'string') {
    return err;
  }

  // Fallback
  return 'Unknown error';
}

/**
 * Convert any Effect error to a standardized AppError ADT.
 * This is the single source of truth for error normalization.
 * Uses type guards to safely extract error details without unsafe casts.
 */
export function convertEffectError(err: unknown): AppError {
  // Already an AppError ADT - return as-is
  if (isAppError(err)) {
    return err;
  }

  // Handle stringified AppError (Effect sometimes serializes errors to JSON)
  // Check if error is a string representation of JSON
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      if (isAppError(parsed)) {
        return parsed;
      }
    } catch {
      // Not valid JSON or not an AppError, will handle below
    }
  }

  // Handle Error objects with a cause that might be stringified JSON
  if (err instanceof Error && err.message) {
    try {
      const parsed = JSON.parse(err.message);
      if (isAppError(parsed)) {
        return parsed;
      }
    } catch {
      // Not JSON in message
    }
  }

  // Handle objects that might have stringified AppError in their toString
  if (err && typeof err === 'object') {
    // Try stringify and parse the whole object FIRST (in case it's a wrapped AppError)
    try {
      const stringified = JSON.stringify(err);
      if (stringified.includes('"_tag"')) {
        const parsed = JSON.parse(stringified);
        if (isAppError(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore circular references or other issues
    }

    // Check for a 'message' property that might contain stringified JSON
    if (hasProperty(err, 'message') && typeof err.message === 'string') {
      try {
        const parsed = JSON.parse(err.message);
        if (isAppError(parsed)) {
          return parsed;
        }
      } catch {
        // Not JSON - that's OK, will handle in fallback
      }
    }
  }

  // HTTP-like error (has status property)
  if (hasProperty(err, 'status')) {
    const status = typeof err.status === 'number' ? err.status : 500;
    const message = extractErrorMessage(err);
    const body = hasProperty(err, 'data')
      ? err.data
      : hasProperty(err, 'body')
        ? err.body
        : undefined;
    return makeHttpError(status, message, body);
  }

  // Standard Error object
  if (err instanceof Error) {
    return makeExternalServiceError('Unknown', err.message);
  }

  // Fallback - extract any message we can find
  const message = extractErrorMessage(err);
  return makeExternalServiceError('Unknown', message);
}

/**
 * Extract a user-friendly error message from an AppError or unknown error.
 * Provides detailed, context-aware messages for each error type.
 */
export function getErrorMessage(err: unknown): string {
  const appError = convertEffectError(err);

  switch (appError._tag) {
    case 'HttpError':
      return appError.message;

    case 'AuthError':
      // AuthError has 'code' and 'message' - prefer message if available
      return appError.message || String(appError.code);

    case 'ValidationError': {
      const issues = appError.issues.map(i => i.message).filter(Boolean);
      return issues.length > 0 ? issues.join('; ') : 'Validation failed';
    }

    case 'ExternalServiceError': {
      const service = appError.service || 'Unknown service';
      let causeMsg = 'Unknown error';

      if (appError.cause instanceof Error) {
        causeMsg = appError.cause.message;
      } else if (typeof appError.cause === 'string') {
        causeMsg = appError.cause;
      } else if (appError.cause !== null && appError.cause !== undefined) {
        causeMsg = String(appError.cause);
      }

      return `${service} error: ${causeMsg}`;
    }

    case 'NotFoundError': {
      const resource = appError.resource || 'Resource';
      const id = appError.id ? `: ${appError.id}` : '';
      return `${resource} not found${id}`;
    }

    default:
      return 'An unexpected error occurred';
  }
}

/**
 * Run an Effect and convert the result to an ApiResponse.
 * This is the standard adapter for service-layer Effects.
 *
 * @param effect - The Effect to run
 * @returns Promise<ApiResponse<T>> with success/error shape
 */
export async function runEffectToApiResponse<T = unknown>(
  effect: EffectType<T, unknown, unknown>
): Promise<ApiResponse<T>> {
  try {
    const result = await Effect.runPromise(
      effect as unknown as EffectType<T, never, never>
    );

    // If result is already an ApiResponse shape, return it
    if (
      result &&
      typeof result === 'object' &&
      'success' in (result as Record<string, unknown>)
    ) {
      return result as unknown as ApiResponse<T>;
    }

    // If result has a nested data field, unwrap it
    if (
      result &&
      typeof result === 'object' &&
      'data' in (result as Record<string, unknown>)
    ) {
      const maybeData = (result as Record<string, unknown>).data;
      const finalData =
        maybeData &&
        typeof maybeData === 'object' &&
        'data' in (maybeData as Record<string, unknown>)
          ? (maybeData as Record<string, unknown>).data
          : maybeData;
      return { success: true, data: finalData as T };
    }

    // Plain success result
    return { success: true, data: result };
  } catch (err: unknown) {
    const appError = convertEffectError(err);
    const message = getErrorMessage(appError);
    return { success: false, error: message };
  }
}

/**
 * Run an Effect safely and return a discriminated union result.
 * Ideal for UI components that need to handle success/error explicitly.
 *
 * @param effect - The Effect to run
 * @returns Promise<RunResult<A>> with ok/error discriminator
 */
export async function runEffectSafely<A>(
  effect: EffectType<A, unknown, unknown>
): Promise<RunResult<A>> {
  try {
    const value = await Effect.runPromise(
      effect as unknown as EffectType<A, never, never>
    );
    return { ok: true, value };
  } catch (error: unknown) {
    const appError = convertEffectError(error);
    const message = getErrorMessage(appError);
    return { ok: false, error: appError, message };
  }
}
