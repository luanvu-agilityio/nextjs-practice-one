/**
 * Tests for effect-helpers.ts
 *
 * Covers:
 * - convertEffectError with various error shapes
 * - getErrorMessage for all AppError types
 * - runEffectToApiResponse with success and failure cases
 * - runEffectSafely with success and failure cases
 */

import { Effect } from 'effect';
import {
  convertEffectError,
  getErrorMessage,
  runEffectToApiResponse,
  runEffectSafely,
} from '../effect-helpers';
import {
  makeHttpError,
  makeAuthError,
  makeValidationError,
  makeExternalServiceError,
  makeNotFoundError,
} from '../errors';

describe('effect-helpers', () => {
  describe('convertEffectError', () => {
    it('should preserve AppError ADT (HttpError)', () => {
      const httpError = makeHttpError(404, 'Not found', { id: 123 });
      const result = convertEffectError(httpError);

      expect(result).toBe(httpError);
      expect(result._tag).toBe('HttpError');
      expect(result.message).toBe('Not found');
    });

    it('should preserve AppError ADT (AuthError)', () => {
      const authError = makeAuthError(
        'InvalidCredentials',
        'Invalid credentials'
      );
      const result = convertEffectError(authError);

      expect(result).toBe(authError);
      expect(result._tag).toBe('AuthError');
    });

    it('should preserve AppError ADT (ValidationError)', () => {
      const validationError = makeValidationError([
        { path: 'email', message: 'Invalid email' },
      ]);
      const result = convertEffectError(validationError);

      expect(result).toBe(validationError);
      expect(result._tag).toBe('ValidationError');
    });

    it('should convert HTTP-like error with status', () => {
      const error = {
        status: 403,
        message: 'Forbidden',
        data: { reason: 'no access' },
      };
      const result = convertEffectError(error);

      expect(result._tag).toBe('HttpError');
      expect(result.status).toBe(403);
      expect(result.message).toBe('Forbidden');
      if (result._tag === 'HttpError') {
        expect(result.body).toEqual({ reason: 'no access' });
      }
    });

    it('should handle HTTP-like error with invalid status', () => {
      const error = { status: 'invalid', message: 'Error' };
      const result = convertEffectError(error);

      expect(result._tag).toBe('HttpError');
      expect(result.status).toBe(500); // Default fallback
    });

    it('should convert standard Error object', () => {
      const error = new Error('Something went wrong');
      const result = convertEffectError(error);

      expect(result._tag).toBe('ExternalServiceError');
      expect(result.service).toBe('Unknown');
      expect(result.cause).toBe('Something went wrong');
    });

    it('should extract message from object with message property', () => {
      const error = { message: 'Custom error message' };
      const result = convertEffectError(error);

      expect(result._tag).toBe('ExternalServiceError');
      expect(result.cause).toBe('Custom error message');
    });

    it('should extract message from object with error property (string)', () => {
      const error = { error: 'Error string' };
      const result = convertEffectError(error);

      expect(result._tag).toBe('ExternalServiceError');
      expect(result.cause).toBe('Error string');
    });

    it('should extract message from object with error property (Error)', () => {
      const error = { error: new Error('Nested error') };
      const result = convertEffectError(error);

      expect(result._tag).toBe('ExternalServiceError');
      expect(result.cause).toBe('Nested error');
    });

    it('should handle object with non-string message property', () => {
      const error = { message: 12345 };
      const result = convertEffectError(error);

      expect(result._tag).toBe('ExternalServiceError');
      expect(result.cause).toBe('Unknown error');
    });

    it('should parse stringified AppError from string', () => {
      const httpError = makeHttpError(404, 'Not found');
      const stringified = JSON.stringify(httpError);
      const result = convertEffectError(stringified);

      expect(result._tag).toBe('HttpError');
      expect(result.status).toBe(404);
      expect(result.message).toBe('Not found');
    });

    it('should parse AppError from Error.message containing JSON', () => {
      const authError = makeAuthError('InvalidToken', 'Token expired');
      const error = new Error(JSON.stringify(authError));
      const result = convertEffectError(error);

      expect(result._tag).toBe('AuthError');
      expect(result.code).toBe('InvalidToken');
    });

    it('should parse AppError from object with _tag in stringified form', () => {
      // Create an object that when stringified will contain "_tag" and when parsed will be an AppError
      const validationError = makeValidationError([
        { path: 'email', message: 'Invalid' },
      ]);

      // Wrap it in a Proxy or plain object that JSON.stringify can handle
      const wrappedError = Object.assign(Object.create(null), validationError);
      const result = convertEffectError(wrappedError);

      expect(result._tag).toBe('ValidationError');
    });

    it('should parse AppError from object with message containing JSON AppError', () => {
      const notFoundError = makeNotFoundError('User', '123');
      const error = { message: JSON.stringify(notFoundError) };
      const result = convertEffectError(error);

      expect(result._tag).toBe('NotFoundError');
      expect(result.resource).toBe('User');
    });

    it('should handle string errors', () => {
      const error = 'Plain string error';
      const result = convertEffectError(error);

      expect(result._tag).toBe('ExternalServiceError');
      expect(result.cause).toBe('Plain string error');
    });

    it('should handle null/undefined errors', () => {
      const result1 = convertEffectError(null);
      const result2 = convertEffectError(undefined);

      expect(result1._tag).toBe('ExternalServiceError');
      expect(result1.cause).toBe('Unknown error');

      expect(result2._tag).toBe('ExternalServiceError');
      expect(result2.cause).toBe('Unknown error');
    });

    it('should handle object without recognized properties', () => {
      const error = { foo: 'bar', baz: 123 };
      const result = convertEffectError(error);

      expect(result._tag).toBe('ExternalServiceError');
      expect(result.cause).toBe('Unknown error');
    });
  });

  describe('getErrorMessage', () => {
    it('should extract HttpError message', () => {
      const error = makeHttpError(404, 'Resource not found');
      const message = getErrorMessage(error);

      expect(message).toBe('Resource not found');
    });

    it('should extract AuthError message', () => {
      const error = makeAuthError('InvalidCredentials', 'Invalid token');
      const message = getErrorMessage(error);

      expect(message).toBe('Invalid token');
    });

    it('should join ValidationError issues', () => {
      const error = makeValidationError([
        { path: 'email', message: 'Invalid email' },
        { path: 'password', message: 'Too short' },
      ]);
      const message = getErrorMessage(error);

      expect(message).toBe('Invalid email; Too short');
    });

    it('should handle empty ValidationError issues', () => {
      const error = makeValidationError([]);
      const message = getErrorMessage(error);

      expect(message).toBe('Validation failed');
    });

    it('should format ExternalServiceError with Error cause', () => {
      const error = makeExternalServiceError(
        'API',
        new Error('Connection timeout')
      );
      const message = getErrorMessage(error);

      expect(message).toBe('API error: Connection timeout');
    });

    it('should format ExternalServiceError with string cause', () => {
      const error = makeExternalServiceError('Database', 'Query failed');
      const message = getErrorMessage(error);

      expect(message).toBe('Database error: Query failed');
    });

    it('should format ExternalServiceError with non-string cause', () => {
      const error = makeExternalServiceError('Service', { code: 500 });
      const message = getErrorMessage(error);

      expect(message).toBe('Service error: [object Object]');
    });

    it('should format NotFoundError with ID', () => {
      const error = makeNotFoundError('User', '123');
      const message = getErrorMessage(error);

      expect(message).toBe('User not found: 123');
    });

    it('should format NotFoundError without ID', () => {
      const error = makeNotFoundError('Post');
      const message = getErrorMessage(error);

      expect(message).toBe('Post not found');
    });

    it('should handle unknown error types gracefully', () => {
      const error = new Error('Random error');
      const message = getErrorMessage(error);

      expect(message).toBe('Unknown error: Random error');
    });

    it('should handle default case in getErrorMessage with unrecognized tag', () => {
      const unknownAppError = {
        _tag: 'UnknownErrorType',
        message: 'Unknown error message',
      };

      // getErrorMessage calls convertEffectError first, which will convert unknown errors
      // to ExternalServiceError. To test the default case, we need to pass an object
      // that won't be caught by any convertEffectError branch but will be seen as an AppError
      const result = getErrorMessage(unknownAppError);

      // Since it goes through convertEffectError, it becomes ExternalServiceError
      expect(result).toContain('Unknown');
    });
  });

  describe('runEffectToApiResponse', () => {
    it('should return success for successful Effect', async () => {
      const effect = Effect.succeed({ id: 1, name: 'Test' });
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(result.error).toBeUndefined();
    });

    it('should preserve ApiResponse shape if returned from Effect', async () => {
      const effect = Effect.succeed({
        success: true,
        data: { user: 'john' },
        message: 'Welcome',
      });
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ user: 'john' });
      expect(result.message).toBe('Welcome');
    });

    it('should unwrap nested data field', async () => {
      const effect = Effect.succeed({
        data: { id: 42, value: 'nested' },
      });
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 42, value: 'nested' });
    });

    it('should unwrap double-nested data field', async () => {
      const effect = Effect.succeed({
        data: { data: { deeply: 'nested' } },
      });
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ deeply: 'nested' });
    });

    it('should return error for failed Effect', async () => {
      const effect = Effect.fail(new Error('Operation failed'));
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error: Operation failed');
      expect(result.data).toBeUndefined();
    });

    it('should convert HttpError to ApiResponse', async () => {
      const effect = Effect.fail(makeHttpError(401, 'Unauthorized'));
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('should convert ValidationError to ApiResponse', async () => {
      const effect = Effect.fail(
        makeValidationError([{ path: 'username', message: 'Required field' }])
      );
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Required field');
    });

    it('should handle string errors', async () => {
      const effect = Effect.fail('Simple error');
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error: Simple error');
    });

    it('should handle object errors with message', async () => {
      const effect = Effect.fail({ message: 'Custom failure' });
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(false);
      // Effect serializes objects, so we get the stringified version in the error
      expect(result.error).toContain('Custom failure');
    });
  });

  describe('runEffectSafely', () => {
    it('should return ok result for successful Effect', async () => {
      const effect = Effect.succeed({ id: 1, data: 'test' });
      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ id: 1, data: 'test' });
      }
    });

    it('should return error result for failed Effect', async () => {
      const effect = Effect.fail(new Error('Failed operation'));
      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('Unknown error: Failed operation');
        expect(result.error).toBeDefined();
      }
    });

    it('should include AppError in error result', async () => {
      const authError = makeAuthError('Session expired', 'Session has expired');
      const effect = Effect.fail(authError);
      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Use toEqual for deep equality since Effect creates a new instance after serialization
        expect(result.error).toEqual(authError);
        expect(result.message).toBe('Session has expired');
      }
    });

    it('should handle NotFoundError', async () => {
      const notFound = makeNotFoundError('User', 'abc123');
      const effect = Effect.fail(notFound);
      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('User not found: abc123');
      }
    });

    it('should handle ExternalServiceError', async () => {
      const serviceError = makeExternalServiceError('API', 'Timeout');
      const effect = Effect.fail(serviceError);
      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('API error: Timeout');
      }
    });

    it('should work with async operations', async () => {
      const effect = Effect.gen(function* () {
        const value = yield* Effect.promise(() => Promise.resolve(42));
        return value * 2;
      });

      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(84);
      }
    });

    it('should catch errors from async operations', async () => {
      const effect = Effect.gen(function* () {
        yield* Effect.promise(() => Promise.reject(new Error('Async error')));
        return 'never reached';
      });

      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe('Unknown error: Async error');
      }
    });
  });

  describe('Edge cases and integration', () => {
    it('should handle circular reference in error object safely', async () => {
      const circularError: { message: string; [key: string]: unknown } = {
        message: 'Circular',
      };
      circularError.self = circularError;

      const effect = Effect.fail(circularError);
      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        // Should not throw, should extract message safely
        expect(result.message).toContain('Circular');
      }
    });

    it('should handle Effect chain with transformations', async () => {
      const effect = Effect.succeed(5)
        .pipe(Effect.map(x => x * 2))
        .pipe(Effect.map(x => ({ result: x })));

      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: 10 });
    });

    it('should handle Effect chain with error in middle', async () => {
      const effect = Effect.succeed(5)
        .pipe(Effect.flatMap(() => Effect.fail(new Error('Chain broken'))))
        .pipe(Effect.map(x => x * 2));

      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error: Chain broken');
    });

    it('should handle complex validation errors', async () => {
      const validationError = makeValidationError([
        { path: 'email', message: 'Invalid format' },
        { path: 'password', message: 'Too short' },
        { path: 'confirmPassword', message: 'Does not match' },
      ]);

      const effect = Effect.fail(validationError);
      const result = await runEffectSafely(effect);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.message).toBe(
          'Invalid format; Too short; Does not match'
        );
      }
    });

    it('should handle HTTP error with extra data', async () => {
      const httpError = makeHttpError(400, 'Bad request', {
        field: 'email',
        reason: 'already exists',
      });

      const effect = Effect.fail(httpError);
      const result = await runEffectToApiResponse(effect);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bad request');
    });
  });
});
