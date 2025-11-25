import { Effect } from 'effect';
import type { Effect as EffectType } from 'effect/Effect';
import { NextResponse } from 'next/server';
import type { AppError } from '@/lib/errors';
import { isHttpError } from '@/lib/errors';
import getFriendlyMessage from '@/lib/getFriendlyMessage';

/**
 * Simplified Effect runner for API routes.
 *
 * Accepts Effects that fail with HttpError, standard Error, or other AppErrors.
 */
export async function runEffectToNextResponse(
  effect: EffectType<unknown, AppError | Error, unknown>,
  onSuccess?: (value: unknown) => NextResponse
): Promise<NextResponse> {
  try {
    const value = await Effect.runPromise(
      effect as unknown as EffectType<unknown, never, never>
    );

    // Allow custom success handler
    if (onSuccess) return onSuccess(value);

    // If value already has success field, return as-is
    if (typeof value === 'object' && value !== null && 'success' in value) {
      return NextResponse.json(value);
    }

    // Default success response
    return NextResponse.json({ success: true, data: value });
  } catch (error: unknown) {
    // Handle HttpError ADT
    if (isHttpError(error)) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    // Handle ExternalServiceError ADT
    if (
      typeof error === 'object' &&
      error !== null &&
      '_tag' in error &&
      (error as { _tag: string })._tag === 'ExternalServiceError'
    ) {
      const cause = (error as { cause?: unknown }).cause;
      const message =
        cause instanceof Error ? cause.message : getFriendlyMessage(cause);
      return NextResponse.json({ success: false, message }, { status: 500 });
    }

    // Handle standard Error instances
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    // Fallback for unknown errors
    return NextResponse.json(
      { success: false, message: getFriendlyMessage(error) },
      { status: 500 }
    );
  }
}

export default runEffectToNextResponse;
