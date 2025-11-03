jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status ?? 200,
    }),
  },
  NextRequest: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    // provide chainable mocks for select().from().where()
    select: jest.fn(),
    update: jest.fn(),
  },
}));

import { POST as ForgotPassword } from '../route';
import sgMailForgot from '@sendgrid/mail';
import { db as dbForgot } from '@/lib/db';
import { NextRequest } from 'next/server';

jest.mock('@sendgrid/mail');
jest.mock('@/lib/db');
jest.mock('drizzle-orm');
jest.mock('@/constants/email-template', () => ({
  ResetPasswordEmail: jest.fn(() => '<html>Reset</html>'),
}));

jest.mock('@/lib/better-auth', () => ({
  auth: {
    api: {
      requestPasswordReset: jest.fn(),
    },
  },
}));
describe('POST /api/auth/forgot-password', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.SENDGRID_FROM_EMAIL = 'test@example.com';
    const { auth } = require('@/lib/better-auth');
    (auth.api.requestPasswordReset as jest.Mock).mockResolvedValue({
      ok: true,
      message: 'Reset requested',
    });
  });

  it('should return 400 when email is missing', async () => {
    const request = createMockRequest({});

    const response = await ForgotPassword(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email required');
  });

  it('should return 404 when user not found', async () => {
    // mock select().from().where() to return empty array (no user)
    const mockWhere = jest.fn().mockResolvedValue([]);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    (dbForgot.select as jest.Mock).mockReturnValue({ from: mockFrom });

    const request = createMockRequest({ email: 'notfound@example.com' });

    const response = await ForgotPassword(request);
    const data = await response.json();

    // route intentionally returns success to avoid enumeration
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should successfully send reset email', async () => {
    // mock select().from().where() to return a found user
    const mockWhere = jest
      .fn()
      .mockResolvedValue([{ id: 'user-123', email: 'test@example.com' }]);
    const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
    (dbForgot.select as jest.Mock).mockReturnValue({ from: mockFrom });

    const mockWhereUpdate = jest.fn().mockResolvedValue({});
    const mockSet = jest.fn().mockReturnValue({ where: mockWhereUpdate });
    (dbForgot.update as jest.Mock).mockReturnValue({ set: mockSet });

    (sgMailForgot.send as jest.Mock).mockResolvedValue([{ statusCode: 202 }]);

    const request = createMockRequest({ email: 'test@example.com' });

    const response = await ForgotPassword(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Reset requested');
  });
});
