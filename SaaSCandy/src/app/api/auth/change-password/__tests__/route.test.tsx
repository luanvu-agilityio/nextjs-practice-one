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

jest.mock('@/lib/better-auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
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

  describe('Authentication', () => {
    it('should return 401 when no session exists', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: request.headers,
      });
    });

    it('should return 401 when session exists but has no user', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
        user: null,
      });

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.message).toBe('Unauthorized');
    });
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

  describe('Account Verification', () => {
    beforeEach(() => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
    });

    it('should return 400 when user has no credential account', async () => {
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'account-google',
          userId: 'user-123',
          providerId: 'google',
        },
      ]);

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Password authentication not enabled. You may have signed in with Google/GitHub.'
      );
    });

    it('should return 400 when credential account has no password', async () => {
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'account-123',
          userId: 'user-123',
          providerId: 'credential',
          password: null,
        },
      ]);

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Password authentication not enabled. You may have signed in with Google/GitHub.'
      );
    });

    it('should return 400 when user has multiple accounts but no credential account', async () => {
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'account-google',
          userId: 'user-123',
          providerId: 'google',
        },
        {
          id: 'account-github',
          userId: 'user-123',
          providerId: 'github',
        },
      ]);

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe(
        'Password authentication not enabled. You may have signed in with Google/GitHub.'
      );
    });
  });

  describe('Password Verification', () => {
    beforeEach(() => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        mockCredentialAccount,
      ]);
    });

    it('should return 400 when current password is incorrect', async () => {
      (verify as jest.Mock).mockResolvedValue(false);

      const request = createMockRequest({
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toBe('Current password is incorrect');
      expect(verify).toHaveBeenCalledWith(
        mockCredentialAccount.password,
        'wrongPassword'
      );
    });

    it('should verify password with correct arguments', async () => {
      (verify as jest.Mock).mockResolvedValue(true);
      const mockUpdate = jest.fn().mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue({}),
        }),
      });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      const request = createMockRequest({
        currentPassword: 'correctPassword',
        newPassword: 'newPassword456',
      });

      await POST(request);

      expect(verify).toHaveBeenCalledWith(
        mockCredentialAccount.password,
        'correctPassword'
      );
    });
  });

  describe('Password Update', () => {
    beforeEach(() => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        mockCredentialAccount,
      ]);
      (verify as jest.Mock).mockResolvedValue(true);
    });

    it('should successfully update password', async () => {
      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Password updated successfully');

      // Verify hash was called with new password
      expect(hash).toHaveBeenCalledWith('newPassword456');

      // Verify database update was called
      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({
        password: 'hashed-new-password',
        updatedAt: expect.any(Date),
      });
      expect(mockWhere).toHaveBeenCalled();
    });

    it('should hash the new password before storing', async () => {
      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      (hash as jest.Mock).mockResolvedValue('super-secure-hashed-password');

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'myNewPassword789',
      });

      await POST(request);

      expect(hash).toHaveBeenCalledWith('myNewPassword789');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'super-secure-hashed-password',
        })
      );
    });

    it('should update the updatedAt timestamp', async () => {
      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      const beforeTime = new Date();

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      await POST(request);

      const afterTime = new Date();

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(Date),
        })
      );

      const updateCall = mockSet.mock.calls[0][0];
      expect(updateCall.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(updateCall.updatedAt.getTime()).toBeLessThanOrEqual(
        afterTime.getTime()
      );
    });

    it('should update the correct account by id', async () => {
      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      await POST(request);

      // Verify where clause was called (would use eq(account.id, credentialAccount.id))
      expect(mockWhere).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
    });

    it('should handle database query errors', async () => {
      const dbError = new Error('Database connection failed');
      (db.query.account.findMany as jest.Mock).mockRejectedValue(dbError);

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Database connection failed');
    });

    it('should handle password verification errors', async () => {
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        mockCredentialAccount,
      ]);
      const verifyError = new Error('Verification service unavailable');
      (verify as jest.Mock).mockRejectedValue(verifyError);

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Verification service unavailable');
    });

    it('should handle password hashing errors', async () => {
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        mockCredentialAccount,
      ]);
      (verify as jest.Mock).mockResolvedValue(true);
      const hashError = new Error('Hashing failed');
      (hash as jest.Mock).mockRejectedValue(hashError);

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Hashing failed');
    });

    it('should handle database update errors', async () => {
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        mockCredentialAccount,
      ]);
      (verify as jest.Mock).mockResolvedValue(true);

      const updateError = new Error('Database update failed');
      const mockWhere = jest.fn().mockRejectedValue(updateError);
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Database update failed');
    });

    it('should handle non-Error exceptions', async () => {
      (db.query.account.findMany as jest.Mock).mockRejectedValue(
        'String error message'
      );

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Failed to change password');
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

    it('should handle session retrieval errors', async () => {
      const sessionError = new Error('Session service down');
      (auth.api.getSession as unknown as jest.Mock).mockRejectedValue(
        sessionError
      );

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe('Session service down');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle user with multiple accounts including credential', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'account-google',
          userId: 'user-123',
          providerId: 'google',
        },
        mockCredentialAccount,
        {
          id: 'account-github',
          userId: 'user-123',
          providerId: 'github',
        },
      ]);
      (verify as jest.Mock).mockResolvedValue(true);

      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      const request = createMockRequest({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(verify).toHaveBeenCalledWith(
        mockCredentialAccount.password,
        'oldPassword123'
      );
    });

    it('should successfully complete full password change flow', async () => {
      (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(
        mockSession
      );
      (db.query.account.findMany as jest.Mock).mockResolvedValue([
        mockCredentialAccount,
      ]);
      (verify as jest.Mock).mockResolvedValue(true);
      (hash as jest.Mock).mockResolvedValue('new-secure-hash');

      const mockWhere = jest.fn().mockResolvedValue({});
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      (db.update as jest.Mock).mockReturnValue(mockUpdate());

      const request = createMockRequest({
        currentPassword: 'myOldPassword',
        newPassword: 'myNewStrongPassword123!',
      });

      const response = await POST(request);
      const data = await response.json();

      // Verify the entire flow
      expect(auth.api.getSession).toHaveBeenCalledWith({
        headers: request.headers,
      });
      expect(db.query.account.findMany).toHaveBeenCalled();
      expect(verify).toHaveBeenCalledWith(
        mockCredentialAccount.password,
        'myOldPassword'
      );
      expect(hash).toHaveBeenCalledWith('myNewStrongPassword123!');
      expect(db.update).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({
        password: 'new-secure-hash',
        updatedAt: expect.any(Date),
      });

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Password updated successfully');
    });
  });
});
