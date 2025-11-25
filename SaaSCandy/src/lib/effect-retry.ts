import { pipe, Effect } from 'effect';
import * as Schedule from 'effect/Schedule';

export interface RetryOptions {
  readonly maxRetries?: number;
  readonly baseDelayMs?: number;
  readonly jitter?: number;
  readonly timeoutMs?: number;
}

const exponentialJitterSchedule = (
  maxRetries: number,
  baseMs: number,
  _jitter: number
) => {
  // Build a schedule: exponential(base) -> jitter -> recurs(n)
  const exp = Schedule.exponential(`${baseMs} millis`);
  const rec = Schedule.recurs(maxRetries);
  // Intersect the exponential backoff schedule with a recurs limiter so we
  // get exponential delays but stop after `maxRetries` attempts.
  const combined = Schedule.intersect(exp, rec);
  return Schedule.jittered(combined);
};

/**
 * Runs an Effect with a timeout and retry schedule. The caller should ensure
 * the inner effect fails with `Effect.fail` for retryable errors and with
 * `Effect.die` (or other non-retriable behavior) for non-retriable failures.
 */
export function runWithRetryAndTimeout<Out, Err = never, Env = never>(
  effect: Effect.Effect<Out, Err, Env>,
  opts?: RetryOptions
): Effect.Effect<Out, Err | Error, Env> {
  const {
    maxRetries = 4,
    baseDelayMs = 200,
    jitter = 0.2,
    timeoutMs = 5000,
  } = opts ?? {};

  const schedule = exponentialJitterSchedule(maxRetries, baseDelayMs, jitter);

  // Apply timeout (library operator accepts Duration input like "5000 millis")
  const timed = pipe(effect, Effect.timeout(`${timeoutMs} millis`));

  // Retry using the constructed schedule
  return pipe(timed, Effect.retry(schedule));
}
