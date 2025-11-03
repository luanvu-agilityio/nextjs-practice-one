import { POST } from '../route';
import { NextRequest } from 'next/server';
import { hash, verify } from '@node-rs/argon2';
import { auth } from '@/lib/better-auth';
import { db } from '@/lib/db';

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn().mockResolvedValue(data),
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    })),
  },
}));

// Mock dependencies
jest.mock('@node-rs/argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

// Replace the two separate better-auth mocks with a single combined mock:
jest.mock('@/lib/better-auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
      changePassword: jest.fn(),
    },
  },
}));

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      account: {
        findMany: jest.fn(),
      },
    },
    update: jest.fn(),
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value })),
}));

describe('/api/auth/change-password', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      headers: new Headers(),
    } as unknown as NextRequest;
  };

  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' },
  };

  const mockCredentialAccount = {
    id: 'account-123',
    userId: 'user-123',
    providerId: 'credential',
    password: 'hashed-old-password',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hash as jest.Mock).mockResolvedValue('hashed-new-password');
  });

  describe('Validation', () => {
    beforeEach(() => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
    });

    it('should return 400 when currentPassword is missing', async () => {
      const request = createMockRequest({
        currentPassword: '',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Current password and new password are required'
      );
    });

    it('should return 400 when newPassword is missing', async () => {
      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Current password and new password are required'
      );
    });

    it('should return 400 when both passwords are missing', async () => {
      const request = createMockRequest({
        currentPassword: '',
        newPassword: '',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Current password and new password are required'
      );
    });

    it('should return 400 when currentPassword is undefined', async () => {
      const request = createMockRequest({
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Current password and new password are required'
      );
    });

    it('should return 400 when newPassword is undefined', async () => {
      const request = createMockRequest({
        currentPassword: 'oldPassword123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Current password and new password are required'
      );
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
    });

    it('should handle JSON parsing errors', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: new Headers(),
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Invalid JSON');
    });
  });
});
