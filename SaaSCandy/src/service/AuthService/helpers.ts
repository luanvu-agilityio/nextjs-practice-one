import type { Effect as EffectType } from 'effect/Effect';

// Use centralized error handling
import { runEffectToApiResponse, ApiResponse } from '@/lib/effect-helpers';

// =============================================================================
// HELPER: Run Effect as Promise (for gradual migration)
// =============================================================================

/**
 * Helper to run an Effect and return a Promise with ApiResponse shape.
 * Uses centralized error handling from effect-helpers.
 *
 * @deprecated Use runEffectToApiResponse from @/lib/effect-helpers directly.
 * This export is kept for backward compatibility.
 */
export const runAuthEffect = async <T = unknown>(
  effect: EffectType<T, unknown, unknown>
): Promise<ApiResponse<T>> => {
  return runEffectToApiResponse(effect);
};
