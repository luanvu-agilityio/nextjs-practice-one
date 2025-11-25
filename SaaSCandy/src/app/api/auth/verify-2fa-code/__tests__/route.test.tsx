import { POST } from '../route';
import { NextRequest } from 'next/server';
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

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      user: {
        findFirst: jest.fn(),
      },
      emailVerificationCode: {
        findFirst: jest.fn(),
      },
    },
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(),
      })),
    })),
    delete: jest.fn(() => ({
      where: jest.fn(),
    })),
  },
}));

describe('/api/auth/verify-2fa-code', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when email or code is missing', async () => {
    const request = createMockRequest({ email: '', code: '' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Email and code are required');
  });

  it('should validate code format', async () => {
    const request = createMockRequest({
      email: 'test@example.com',
      code: '123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code must be 6 digits');
  });

  it('should return error when user not found', async () => {
    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({
      email: 'test@example.com',
      code: '123456',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid verification code');
  });
});
describe('/api/auth/verify-2fa-code', () => {
  const createMockRequest = (body: Record<string, unknown>) =>
    ({
      json: jest.fn().mockResolvedValue(body),
    }) as unknown as NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when email or code is missing', async () => {
    const request = createMockRequest({ email: '', code: '' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Email and code are required');
  });

  it('should validate code format', async () => {
    const request = createMockRequest({
      email: 'test@example.com',
      code: '123',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Code must be 6 digits');
  });

  it('should return error when user not found', async () => {
    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({
      email: 'test@example.com',
      code: '123456',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid verification code');
  });

  it('should return error when verification code not found or expired', async () => {
    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });
    (db.query.emailVerificationCode.findFirst as jest.Mock).mockResolvedValue(
      null
    );

    const request = createMockRequest({
      email: 'test@example.com',
      code: '123456',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/expired/i);
  });

  it('should handle unexpected errors', async () => {
    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected');
    });

    const request = createMockRequest({
      email: 'test@example.com',
      code: '123456',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Failed to verify code');
    expect(data.error).toBe('Unexpected');
  });
  it('should return error for too many attempts', async () => {
    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });
    (db.query.emailVerificationCode.findFirst as jest.Mock).mockResolvedValue({
      id: 'code-1',
      userId: '1',
      code: '123456',
      verified: false,
      expiresAt: new Date(Date.now() + 10000),
      attempts: '3',
    });

    const request = createMockRequest({
      email: 'test@example.com',
      code: '123456',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/too many/i);
  });

  it('should return error for wrong code and increment attempts', async () => {
    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });
    (db.query.emailVerificationCode.findFirst as jest.Mock).mockResolvedValue({
      id: 'code-1',
      userId: '1',
      code: '654321',
      verified: false,
      expiresAt: new Date(Date.now() + 10000),
      attempts: '1',
    });

    const request = createMockRequest({
      email: 'test@example.com',
      code: '123456',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data.error).toMatch(/Invalid code/);
  });

  it('should verify code and return credentials', async () => {
    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });
    (db.query.emailVerificationCode.findFirst as jest.Mock).mockResolvedValue({
      id: 'code-1',
      userId: '1',
      code: '123456',
      verified: false,
      expiresAt: new Date(Date.now() + 10000),
      attempts: '0',
      tempPassword: 'pw123',
    });

    const request = createMockRequest({
      email: 'test@example.com',
      code: '123456',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual({ email: 'test@example.com', password: 'pw123' });
    expect(data.message).toBe('Verification successful');
  });
});
