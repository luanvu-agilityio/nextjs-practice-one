import {
  send2FACode,
  verify2FACode,
  changePassword,
  updateProfile,
  verifyEmail,
} from '@/service/AuthService';

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

      const result = await send2FACode('test@example.com', 'password123');

      expect(result.success).toBe(true);
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

      const result = await send2FACode('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should propagate message from response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Code sent', data: {} }),
      } as Response);
      const result = await send2FACode('test@example.com', 'password123');
      expect(result.message).toBe('Code sent');
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

      const result = await verify2FACode('test@example.com', '123456');

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('email');
    });

    it('should handle error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid code' }),
      } as Response);
      const result = await verify2FACode('test@example.com', 'badcode');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid code');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, message: 'Password changed' }),
      } as Response);

      const result = await changePassword('oldpass', 'newpass');

      expect(result.success).toBe(true);
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
      const result = await changePassword('oldpass', 'badpass');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Change failed');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await updateProfile({ name: 'John Doe' });

      expect(result.success).toBe(true);
    });

    it('should handle error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Update failed' }),
      } as Response);
      const result = await updateProfile({ name: 'Bad User' });
      expect(result.success).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await verifyEmail('test-token');

      expect(result.success).toBe(true);
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
      const result = await verifyEmail('bad-token');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Token invalid');
    });
    describe('apiRequest', () => {
      it('should handle fetch throwing error', async () => {
        (
          global.fetch as jest.MockedFunction<typeof fetch>
        ).mockImplementationOnce(() => {
          throw new Error('Network error');
        });
        const { send2FACode } = require('@/service/AuthService');
        const result = await send2FACode('test@example.com', 'password123');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Network error');
      });
      it('should handle fetch throwing non-Error', async () => {
        (
          global.fetch as jest.MockedFunction<typeof fetch>
        ).mockImplementationOnce(() => {
          // @ts-ignore
          throw 'fail';
        });
        const { send2FACode } = require('@/service/AuthService');
        const result = await send2FACode('test@example.com', 'password123');
        expect(result.success).toBe(false);
        expect(result.error).toBe('Unknown error');
      });
    });
  });
});
