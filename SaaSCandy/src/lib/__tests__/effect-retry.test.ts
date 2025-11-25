import { Effect } from 'effect';
import { runWithRetryAndTimeout } from '../effect-retry';

describe('effect-retry', () => {
  it('retries failing effects and eventually succeeds', async () => {
    let attempts = 0;

    const flaky = Effect.flatMap(
      Effect.sync(() => attempts++),
      count =>
        count < 3 ? Effect.fail(new Error('fail')) : Effect.succeed('ok')
    );

    const wrapped = runWithRetryAndTimeout(flaky, {
      maxRetries: 5,
      baseDelayMs: 10,
      jitter: 0,
      timeoutMs: 1000,
    });

    const res = await Effect.runPromise(Effect.either(wrapped));
    expect(res._tag === 'Right' ? res.right : undefined).toBe('ok');
  });

  it('accepts default options without throwing', async () => {
    const e = Effect.succeed('x');
    const wrapped = runWithRetryAndTimeout(e);
    const res = await Effect.runPromise(Effect.either(wrapped));
    expect(res._tag === 'Right' ? res.right : undefined).toBe('x');
  });
});
