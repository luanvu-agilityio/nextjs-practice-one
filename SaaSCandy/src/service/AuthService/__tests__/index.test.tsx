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
  });
});
