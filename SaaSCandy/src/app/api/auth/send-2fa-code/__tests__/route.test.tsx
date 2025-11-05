import { POST as Send2FACode } from '../route';
import { NextRequest } from 'next/server';
import sgMail from '@sendgrid/mail';
import { db } from '@/lib/db';
import { auth } from '@/lib/better-auth';

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: jest.fn().mockResolvedValue(data),
      status: init?.status || 200,
    })),
  },
}));

jest.mock('@sendgrid/mail', () => ({
  __esModule: true,
  default: {
    setApiKey: jest.fn(),
    send: jest.fn(),
  },
}));

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      user: {
        findFirst: jest.fn(),
      },
    },
    delete: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('@/lib/better-auth', () => ({
  auth: {
    api: {
      signInEmail: jest.fn(),
    },
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value })),
}));

jest.mock('@/constants/email-template', () => ({
  TwoFactorEmail: jest.fn(() => '<html>Code</html>'),
}));

describe('POST /api/auth/send-2fa-code', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.SENDGRID_FROM_EMAIL = 'test@example.com';
  });

  it('should return 400 when email is missing', async () => {
    const request = createMockRequest({
      password: 'password123',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Email and password are required');
  });

  it('should return 400 when password is missing', async () => {
    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Email and password are required');
  });

  it('should return 401 when sign-in fails', async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email or password');
  });

  it('should return 401 when sign-in has no user', async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValue({
      user: null,
    });

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('should successfully send 2FA code', async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const mockWhere = jest.fn().mockResolvedValue({});
    (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });

    const mockValues = jest.fn().mockResolvedValue({});
    (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

    (sgMail.send as jest.Mock).mockResolvedValue([{ statusCode: 202 }]);

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Login code sent to your email');
    expect(sgMail.send).toHaveBeenCalled();
  });

  it('should continue when email send fails', async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      },
    });

    const mockWhere = jest.fn().mockResolvedValue({});
    (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });

    const mockValues = jest.fn().mockResolvedValue({});
    (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

    (sgMail.send as jest.Mock).mockRejectedValue(new Error('Email failed'));

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it('should handle errors with Error instance', async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockRejectedValue(
      new Error('Auth service down')
    );

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Auth service down');
  });

  it('should handle errors with non-Error instance', async () => {
    (auth.api.signInEmail as unknown as jest.Mock).mockRejectedValue(
      'String error'
    );

    const request = createMockRequest({
      email: 'test@example.com',
      password: 'password123',
    });

    const response = await Send2FACode(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unknown error');
  });
});
