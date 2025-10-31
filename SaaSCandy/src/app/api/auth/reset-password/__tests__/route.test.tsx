import { POST } from '../route';
import { NextRequest } from 'next/server';
import { hash } from '@node-rs/argon2';
import { db } from '@/lib/db';

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn().mockResolvedValue(data),
      status: init?.status || 200,
    })),
  },
}));

jest.mock('@node-rs/argon2', () => ({
  hash: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      user: {
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(),
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value })),
}));

describe('POST /api/auth/reset-password', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (hash as jest.Mock).mockResolvedValue('hashed-new-password');
  });

  it('should return 400 when token is missing', async () => {
    const request = createMockRequest({
      newPassword: 'newPassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Token and new password required');
  });

  it('should return 400 when newPassword is missing', async () => {
    const request = createMockRequest({
      token: 'reset-token-123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Token and new password required');
  });

  it('should return 400 when user not found', async () => {
    (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({
      token: 'invalid-token',
      newPassword: 'newPassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid or expired token');
  });

  it('should return 400 when resetTokenExpires is null', async () => {
    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-123',
      resetToken: 'valid-token',
      resetTokenExpires: null,
    });

    const request = createMockRequest({
      token: 'valid-token',
      newPassword: 'newPassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid or expired token');
  });

  it('should return 400 when token is expired', async () => {
    const expiredDate = new Date(Date.now() - 3600000); // 1 hour ago

    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-123',
      resetToken: 'expired-token',
      resetTokenExpires: expiredDate,
    });

    const request = createMockRequest({
      token: 'expired-token',
      newPassword: 'newPassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Invalid or expired token');
  });

  it('should successfully reset password with valid token', async () => {
    const futureDate = new Date(Date.now() + 3600000); // 1 hour from now

    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: 'user-123',
      resetToken: 'valid-token',
      resetTokenExpires: futureDate,
    });

    const mockWhere = jest.fn().mockResolvedValue({});
    const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
    (db.update as jest.Mock).mockReturnValue({ set: mockSet });

    const request = createMockRequest({
      token: 'valid-token',
      newPassword: 'newSecurePassword123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Password updated');

    expect(hash).toHaveBeenCalledWith('newSecurePassword123');
    expect(mockSet).toHaveBeenCalledWith({
      password: 'hashed-new-password',
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: expect.any(Date),
    });
    expect(mockWhere).toHaveBeenCalled();
  });
});
