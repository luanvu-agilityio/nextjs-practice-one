import { Effect } from 'effect';

// Client HTTP
import { http } from './index';

// Constants
import { API_ROUTES } from '@/constants';

/**
 * Helper to run an Effect and return a Promise for use in React components.
 * Use this in components until you're ready for full Effect composition.
 */
export const runHttpEffect = async <T = unknown>(
  effect: Effect.Effect<T, unknown, never>
): Promise<T> => {
  return (await Effect.runPromise(effect)) as T;
};

/**
 * Common API calls wrapped as Effects
 */
export const apiEffects = {
  send2FASMS: (data: { phone: string; email: string; password: string }) =>
    http.post(API_ROUTES.AUTH.SEND_2FA_SMS, data),

  verify2FASMS: (data: { phone: string; code: string }) =>
    http.put(API_ROUTES.AUTH.SEND_2FA_SMS, data),
};
