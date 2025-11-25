/**
 * Tests for AuthService/helpers.ts
 *
 * Tests the runAuthEffect wrapper (deprecated but still used)
 * to ensure backward compatibility
 */

import { Effect } from 'effect';
import { runAuthEffect } from '../helpers';
import { makeHttpError, makeAuthError } from '@/lib/errors';

describe('AuthService helpers', () => {
  describe('runAuthEffect', () => {
    it('should be a wrapper around runEffectToApiResponse', async () => {
      const effect = Effect.succeed({ userId: 123, token: 'abc' });
      const result = await runAuthEffect(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ userId: 123, token: 'abc' });
    });

    it('should handle auth-specific errors', async () => {
      const authError = makeAuthError(
        'InvalidCredentials',
        'Invalid credentials'
      );
      const effect = Effect.fail(authError);
      const result = await runAuthEffect(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle HTTP errors from auth API', async () => {
      const httpError = makeHttpError(401, 'Unauthorized access');
      const effect = Effect.fail(httpError);
      const result = await runAuthEffect(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized access');
    });

    it('should handle Effect chains', async () => {
      const effect = Effect.gen(function* () {
        const user = yield* Effect.succeed({ id: 1, name: 'John' });
        const token = yield* Effect.succeed('token123');
        return { user, token };
      });

      const result = await runAuthEffect(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        user: { id: 1, name: 'John' },
        token: 'token123',
      });
    });

    it('should handle failures in Effect chains', async () => {
      const effect = Effect.gen(function* () {
        const user = yield* Effect.succeed({ id: 1 });
        yield* Effect.fail(new Error('Token generation failed'));
        return user;
      });

      const result = await runAuthEffect(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error: Token generation failed');
    });

    it('should work with async operations', async () => {
      const effect = Effect.gen(function* () {
        const data = yield* Effect.promise(() =>
          Promise.resolve({ authenticated: true, sessionId: 'xyz' })
        );
        return data;
      });

      const result = await runAuthEffect(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ authenticated: true, sessionId: 'xyz' });
    });

    it('should handle rejected promises in Effect', async () => {
      const effect = Effect.gen(function* () {
        yield* Effect.promise(() => Promise.reject(new Error('Network error')));
        return 'never reached';
      });

      const result = await runAuthEffect(effect);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should preserve ApiResponse shape if Effect returns it', async () => {
      const effect = Effect.succeed({
        success: true,
        data: { user: { id: 1, email: 'test@example.com' } },
        message: 'Login successful',
      });

      const result = await runAuthEffect(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        user: { id: 1, email: 'test@example.com' },
      });
      expect(result.message).toBe('Login successful');
    });

    it('should handle various error shapes consistently', async () => {
      // String error
      const result1 = await runAuthEffect(Effect.fail('Error message'));
      expect(result1.success).toBe(false);
      expect(result1.error).toContain('Error message');

      // Object with message
      const result2 = await runAuthEffect(
        Effect.fail({ message: 'Custom error' })
      );
      expect(result2.success).toBe(false);
      expect(result2.error).toContain('Custom error');

      // Error instance
      const result3 = await runAuthEffect(
        Effect.fail(new Error('Standard error'))
      );
      expect(result3.success).toBe(false);
      expect(result3.error).toContain('Standard error');
    });

    it('should handle null/undefined results gracefully', async () => {
      const effect1 = Effect.succeed(null);
      const result1 = await runAuthEffect(effect1);
      expect(result1.success).toBe(true);
      expect(result1.data).toBeNull();

      const effect2 = Effect.succeed(undefined);
      const result2 = await runAuthEffect(effect2);
      expect(result2.success).toBe(true);
      expect(result2.data).toBeUndefined();
    });

    it('should work with typed Effects', async () => {
      interface User {
        id: number;
        email: string;
        role: string;
      }

      const effect: Effect.Effect<User, Error, never> = Effect.succeed({
        id: 42,
        email: 'user@example.com',
        role: 'admin',
      });

      const result = await runAuthEffect(effect);

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        const user = result.data as User;
        expect(user.id).toBe(42);
        expect(user.email).toBe('user@example.com');
        expect(user.role).toBe('admin');
      }
    });
  });
});
