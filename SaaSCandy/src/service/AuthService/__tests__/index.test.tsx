import {
  send2FACode,
  verify2FACode,
  changePassword,
  updateProfile,
  verifyEmail,
} from '@/service/AuthService';
import { Effect } from 'effect';

import type { ApiResponse } from '@/service/AuthService';
import { AppError } from '@/lib/errors';
import { runAuthEffect } from '../helpers';

function run<T>(effect: Effect.Effect<T, unknown, unknown>): Promise<T> {
  return runAuthEffect(
    effect as unknown as Effect.Effect<unknown, AppError, unknown>
  ) as Promise<T>;
}

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('send2FACode', () => {
    it('should send 2FA code successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Code sent' }),
      } as Response);

      const result = (await run(
        send2FACode('test@example.com', 'password123')
      )) as ApiResponse | undefined;

      expect(result && result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
    });

    it('should handle errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed to send' }),
      } as Response);

      const result = (await run(
        send2FACode('test@example.com', 'password123')
      )) as ApiResponse | undefined;

      expect(result && result.success).toBe(false);
      expect(result && result.error).toBeDefined();
    });

    it('should propagate message from response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Code sent', data: {} }),
      } as Response);
      const result = (await run(
        send2FACode('test@example.com', 'password123')
      )) as ApiResponse | undefined;
      expect(result?.message).toBe('Code sent');
    });
  });

  describe('verify2FACode', () => {
    it('should verify code successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: { email: 'test@example.com', password: 'password123' },
        }),
      } as Response);

      const result = (await run(
        verify2FACode('test@example.com', '123456')
      )) as ApiResponse | undefined;

      expect(result && result.success).toBe(true);
      expect(result && result.data).toHaveProperty('email');
    });

    it('should handle error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid code' }),
      } as Response);
      const result = (await run(
        verify2FACode('test@example.com', '999999') // Valid format but wrong code
      )) as ApiResponse | undefined;
      expect(result && result.success).toBe(false);
      expect(result && result.error).toEqual(
        expect.stringContaining('Invalid code')
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Password changed' }),
      } as Response);

      const result = (await run(changePassword('oldpass', 'newpass'))) as
        | ApiResponse
        | undefined;

      expect(result && result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Change failed' }),
      } as Response);
      const result = (await run(changePassword('oldpass', 'badpass'))) as
        | ApiResponse
        | undefined;
      expect(result && result.success).toBe(false);
      expect(result && result.error).toEqual(
        expect.stringContaining('Change failed')
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = (await run(updateProfile({ name: 'John Doe' }))) as
        | ApiResponse
        | undefined;

      expect(result && result.success).toBe(true);
    });

    it('should handle error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Update failed' }),
      } as Response);
      const result = (await run(updateProfile({ name: 'Bad User' }))) as
        | ApiResponse
        | undefined;
      expect(result && result.success).toBe(false);
      expect(result && result.error).toEqual(
        expect.stringContaining('Update failed')
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = (await run(verifyEmail('test-token'))) as
        | ApiResponse
        | undefined;

      expect(result && result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('token=test-token'),
        expect.any(Object)
      );
    });

    it('should handle error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Token invalid' }),
      } as Response);
      const result = (await run(verifyEmail('bad-token'))) as
        | ApiResponse
        | undefined;
      expect(result && result.success).toBe(false);
      expect(result && result.error).toEqual(
        expect.stringContaining('Token invalid')
      );
    });
    describe('apiRequest', () => {
      it('should handle fetch throwing error', async () => {
        (
          global.fetch as jest.MockedFunction<typeof fetch>
        ).mockImplementationOnce(() => {
          throw new Error('Network error');
        });
        const result = (await run(
          send2FACode('test@example.com', 'password123')
        )) as ApiResponse | undefined;
        expect(result && result.success).toBe(false);
        // Validation passes, but fetch throws - should see "Failed to send 2FA code" or retry errors
        expect(result && result.error).toBeDefined();
      });
      it('should handle fetch throwing non-Error', async () => {
        (
          global.fetch as jest.MockedFunction<typeof fetch>
        ).mockImplementationOnce(() => {
          throw 'fail';
        });
        const result = (await run(
          send2FACode('test@example.com', 'password123')
        )) as ApiResponse | undefined;
        expect(result && result.success).toBe(false);
        expect(result && result.error).toBeDefined();
      });
    });
  });
});
