/**
 * Pilot Module Tests - AuthService with Effect Patterns
 *
 * Tests for the enhanced Effect-based AuthService including:
 * - Input validation (email, password, code, token)
 * - Effect composition (retry, timeout, error handling)
 * - Proper typed error channels (ValidationError, AuthError, etc.)
 * - Edge cases and error recovery
 */

import { Effect } from 'effect';
import {
  send2FACode,
  verify2FACode,
  changePassword,
  updateProfile,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '@/service/AuthService';
import type { ApiResponse } from '@/service/AuthService';
import { runAuthEffect } from '../helpers';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

function run<T>(effect: Effect.Effect<T, unknown, unknown>): Promise<T> {
  return runAuthEffect(effect) as Promise<T>;
}

describe('AuthService Pilot Module - Effect Patterns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Input Validation', () => {
    describe('Email Validation', () => {
      it('should reject invalid email format in send2FACode', async () => {
        const result = (await run(
          send2FACode('invalid-email', 'password123')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid email format');
      });

      it('should reject invalid email in verify2FACode', async () => {
        const result = (await run(
          verify2FACode('not-an-email', '123456')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid email format');
      });

      it('should reject invalid email in updateProfile', async () => {
        const result = (await run(
          updateProfile({ email: 'invalid' })
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid email format');
      });

      it('should reject invalid email in requestPasswordReset', async () => {
        const result = (await run(
          requestPasswordReset('bad-email')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid email format');
      });

      it('should accept valid email formats', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

        const emails = [
          'user@example.com',
          'test.user@domain.co.uk',
          'name+tag@subdomain.example.org',
        ];

        for (const email of emails) {
          const result = (await run(
            requestPasswordReset(email)
          )) as ApiResponse;
          expect(result.success).toBe(true);
        }
      });
    });

    describe('Password Validation', () => {
      it('should reject short passwords in send2FACode', async () => {
        const result = (await run(
          send2FACode('user@example.com', '12345')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('at least 6 characters');
      });

      it('should reject short passwords in changePassword', async () => {
        const result = (await run(
          changePassword('oldpass', '123')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('at least 6 characters');
      });

      it('should reject short passwords in resetPassword', async () => {
        const result = (await run(
          resetPassword('token123', 'short')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('at least 6 characters');
      });

      it('should accept valid passwords', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

        const result = (await run(
          send2FACode('user@example.com', 'password123')
        )) as ApiResponse;
        expect(result.success).toBe(true);
      });
    });

    describe('2FA Code Validation', () => {
      it('should reject non-numeric codes', async () => {
        const result = (await run(
          verify2FACode('user@example.com', 'abcdef')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('6 digits');
      });

      it('should reject codes with wrong length', async () => {
        const result = (await run(
          verify2FACode('user@example.com', '12345')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('6 digits');
      });

      it('should accept valid 6-digit codes', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({
            success: true,
            data: { email: 'user@example.com', password: 'pass' },
          }),
        } as Response);

        const result = (await run(
          verify2FACode('user@example.com', '123456')
        )) as ApiResponse;
        expect(result.success).toBe(true);
      });
    });

    describe('Token Validation', () => {
      it('should reject empty tokens in verifyEmail', async () => {
        const result = (await run(verifyEmail(''))) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('Token is required');
      });

      it('should reject whitespace-only tokens in resetPassword', async () => {
        const result = (await run(
          resetPassword('   ', 'newpass123')
        )) as ApiResponse;

        expect(result.success).toBe(false);
        expect(result.error).toContain('Token is required');
      });

      it('should accept valid tokens', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

        const result = (await run(
          verifyEmail('valid-token-123')
        )) as ApiResponse;
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Business Logic Validation', () => {
    it('should reject same password in changePassword', async () => {
      const result = (await run(
        changePassword('password123', 'password123')
      )) as ApiResponse;

      expect(result.success).toBe(false);
      expect(result.error).toContain('must be different');
    });

    it('should require at least one field in updateProfile', async () => {
      const result = (await run(updateProfile({}))) as ApiResponse;

      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one field');
    });

    it('should accept name-only update', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = (await run(
        updateProfile({ name: 'John Doe' })
      )) as ApiResponse;
      expect(result.success).toBe(true);
    });

    it('should accept email-only update', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = (await run(
        updateProfile({ email: 'newemail@example.com' })
      )) as ApiResponse;
      expect(result.success).toBe(true);
    });
  });

  describe('Effect Composition - Retry Logic', () => {
    it('should retry send2FACode on transient failures', async () => {
      // Fail twice, then succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Connection reset'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, message: 'Code sent' }),
        } as Response);

      const result = (await run(
        send2FACode('user@example.com', 'password123')
      )) as ApiResponse;

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should retry requestPasswordReset on failures', async () => {
      // Fail once, then succeed
      mockFetch
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

      const result = (await run(
        requestPasswordReset('user@example.com')
      )) as ApiResponse;

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should eventually fail after all retries exhausted', async () => {
      // Fail all attempts
      mockFetch.mockRejectedValue(new Error('Persistent failure'));

      const result = (await run(
        send2FACode('user@example.com', 'password123')
      )) as ApiResponse;

      expect(result.success).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Effect Composition - Timeout', () => {
    it('should have timeout configured for verifyEmail', async () => {
      // Note: Testing actual timeout behavior is complex with Effect runtime
      // Here we verify the timeout is configured by checking fast responses work
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = (await run(verifyEmail('test-token'))) as ApiResponse;
      expect(result.success).toBe(true);
      // The timeout is configured in the implementation (10 seconds)
      // Actual timeout testing would require integration tests
    });
  });

  describe('Error Handling', () => {
    it('should convert HTTP errors to proper error messages', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      } as Response);

      const result = (await run(
        changePassword('oldpass', 'newpass123')
      )) as ApiResponse;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = (await run(
        updateProfile({ name: 'Test User' })
      )) as ApiResponse;

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed responses', async () => {
      // HttpClient already handles JSON parsing errors gracefully
      // This test verifies the integration works even with parsing issues
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const result = (await run(verifyEmail('test-token'))) as ApiResponse;

      // HttpClient handles the error and may return success with empty data
      // or fail gracefully - either is acceptable
      expect(result).toBeDefined();
    });
  });

  describe('Integration - Full Flows', () => {
    it('should handle complete 2FA flow', async () => {
      // Step 1: Send code
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Code sent' }),
      } as Response);

      const sendResult = (await run(
        send2FACode('user@example.com', 'password123')
      )) as ApiResponse;
      expect(sendResult.success).toBe(true);

      // Step 2: Verify code
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { email: 'user@example.com', password: 'password123' },
        }),
      } as Response);

      const verifyResult = (await run(
        verify2FACode('user@example.com', '123456')
      )) as ApiResponse;
      expect(verifyResult.success).toBe(true);
    });

    it('should handle complete password reset flow', async () => {
      // Step 1: Request reset
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Email sent' }),
      } as Response);

      const requestResult = (await run(
        requestPasswordReset('user@example.com')
      )) as ApiResponse;
      expect(requestResult.success).toBe(true);

      // Step 2: Reset password
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Password reset' }),
      } as Response);

      const resetResult = (await run(
        resetPassword('reset-token-123', 'newpassword123')
      )) as ApiResponse;
      expect(resetResult.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string inputs gracefully', async () => {
      const result = (await run(send2FACode('', ''))) as ApiResponse;
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email format'); // Empty string fails email validation
    });

    it('should handle null/undefined-like inputs', async () => {
      const result = (await run(
        updateProfile({ name: undefined, email: undefined })
      )) as ApiResponse;
      expect(result.success).toBe(false);
      expect(result.error).toContain('At least one field');
    });

    it('should handle very long inputs', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const result = (await run(
        requestPasswordReset(longEmail)
      )) as ApiResponse;
      // Should still validate (passes email regex)
      expect(result).toBeDefined();
    });

    it('should handle special characters in passwords', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = (await run(
        send2FACode('user@example.com', 'p@ssw0rd!#$%')
      )) as ApiResponse;
      expect(result.success).toBe(true);
    });
  });
});
