jest.mock('../index', () => ({
  http: {
    post: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('effect', () => ({
  Effect: {
    promise: function* (fn: () => Promise<unknown>) {
      return yield fn();
    },
    gen: (genFn: () => Generator) => genFn,
    runPromise: async (effect: unknown) => {
      // Handle both generator functions and plain effect values
      if (typeof effect === 'function') {
        const generator = (effect as () => Generator)();
        let result = generator.next();
        let lastValue;

        while (!result.done) {
          if (result.value && typeof result.value.next === 'function') {
            const nestedGenerator = result.value;
            let nestedResult = nestedGenerator.next();
            while (!nestedResult.done) {
              if (typeof nestedResult.value === 'function') {
                try {
                  lastValue = await nestedResult.value();
                } catch (error) {
                  nestedResult = nestedGenerator.throw(error);
                  continue;
                }
              } else {
                lastValue = await Promise.resolve(nestedResult.value);
              }
              nestedResult = nestedGenerator.next(lastValue);
            }
            lastValue = nestedResult.value;
          } else if (typeof result.value === 'function') {
            try {
              lastValue = await result.value();
            } catch (error) {
              result = generator.throw(error);
              continue;
            }
          } else {
            lastValue = await Promise.resolve(result.value);
          }
          result = generator.next(lastValue);
        }

        return result.value;
      } else if (effect && typeof effect === 'object' && '_tag' in effect) {
        // Handle Effect values created by succeed/fail
        const eff = effect as {
          _tag: string;
          value?: unknown;
          error?: unknown;
        };
        if (eff._tag === 'Success') {
          return Promise.resolve(eff.value);
        } else if (eff._tag === 'Failure') {
          return Promise.reject(eff.error);
        }
      }
      return Promise.resolve(effect);
    },
    succeed: jest.fn(value => ({
      _tag: 'Success',
      value,
    })),
    fail: jest.fn(error => ({
      _tag: 'Failure',
      error,
    })),
  },
}));

import { runHttpEffect, apiEffects } from '../helper';
import { http } from '../index';
import { Effect } from 'effect';

describe('HttpClient helper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('runHttpEffect', () => {
    it('should successfully run an Effect and return the result', async () => {
      const mockEffect = Effect.succeed({ data: 'test' });
      const result = await runHttpEffect(mockEffect);

      expect(result).toEqual({ data: 'test' });
    });

    it('should handle Effect that resolves to string', async () => {
      const mockEffect = Effect.succeed('success');
      const result = await runHttpEffect(mockEffect);

      expect(result).toBe('success');
    });

    it('should handle Effect that resolves to number', async () => {
      const mockEffect = Effect.succeed(42);
      const result = await runHttpEffect(mockEffect);

      expect(result).toBe(42);
    });

    it('should handle Effect that resolves to null', async () => {
      const mockEffect = Effect.succeed(null);
      const result = await runHttpEffect(mockEffect);

      expect(result).toBeNull();
    });

    it('should propagate errors from failed Effects', async () => {
      const mockEffect = Effect.fail(new Error('Test error'));

      await expect(runHttpEffect(mockEffect)).rejects.toThrow('Test error');
    });
  });

  describe('apiEffects', () => {
    describe('send2FASMS', () => {
      it('should call http.post with correct endpoint and data', () => {
        const data = {
          phone: '+1234567890',
          email: 'test@example.com',
          password: 'password123',
        };

        apiEffects.send2FASMS(data);

        expect(http.post).toHaveBeenCalledWith('/api/auth/send-2fa-sms', data);
      });

      it('should handle different phone formats', () => {
        const data = {
          phone: '555-1234',
          email: 'user@test.com',
          password: 'pass',
        };

        apiEffects.send2FASMS(data);

        expect(http.post).toHaveBeenCalledWith('/api/auth/send-2fa-sms', data);
      });
    });

    describe('verify2FASMS', () => {
      it('should call http.put with correct endpoint and data', () => {
        const data = {
          phone: '+1234567890',
          code: '123456',
        };

        apiEffects.verify2FASMS(data);

        expect(http.put).toHaveBeenCalledWith('/api/auth/send-2fa-sms', data);
      });

      it('should handle 6-digit verification codes', () => {
        const data = {
          phone: '555-1234',
          code: '999999',
        };

        apiEffects.verify2FASMS(data);

        expect(http.put).toHaveBeenCalledWith('/api/auth/send-2fa-sms', data);
      });

      it('should handle different code formats', () => {
        const data = {
          phone: '+1234567890',
          code: '000000',
        };

        apiEffects.verify2FASMS(data);

        expect(http.put).toHaveBeenCalledWith('/api/auth/send-2fa-sms', data);
      });
    });
  });
});
