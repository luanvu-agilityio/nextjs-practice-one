import { POST as SendVerificationEmail } from '../route';
import sgMailVerify from '@sendgrid/mail';
import type { NextRequest } from 'next/server';

jest.mock('@sendgrid/mail');
jest.mock('@/constants/email-template', () => ({
  VerificationEmail: jest.fn(() => '<html>Verify</html>'),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: unknown) => ({
      json: async () => data,
      status:
        init && typeof init === 'object' && 'status' in init
          ? (init as { status: number }).status
          : 200,
    }),
  },
  NextRequest: jest.fn(),
}));

describe('POST /api/auth/send-verification-email', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BETTER_AUTH_URL = 'http://localhost:3000';
    process.env.SENDGRID_API_KEY = 'test-key';
    process.env.SENDGRID_FROM_EMAIL = 'test@example.com';
  });

  it('should successfully send verification email', async () => {
    (sgMailVerify.send as jest.Mock).mockResolvedValue([
      { statusCode: 202, body: 'sent' },
    ]);

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await SendVerificationEmail(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Verification email sent');
    expect(data.data).toBeDefined();
    expect(sgMailVerify.send).toHaveBeenCalled();
  });

  it('should handle Error instance', async () => {
    (sgMailVerify.send as jest.Mock).mockRejectedValue(
      new Error('SendGrid API error')
    );

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await SendVerificationEmail(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.message).toBe('SendGrid API error');
  });

  it('should handle string error', async () => {
    (sgMailVerify.send as jest.Mock).mockRejectedValue('String error message');

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await SendVerificationEmail(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.message).toBe('String error message');
  });

  it('should handle JSON-serializable error', async () => {
    (sgMailVerify.send as jest.Mock).mockRejectedValue({
      code: 500,
      msg: 'error',
    });

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await SendVerificationEmail(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.message).toBe('{"code":500,"msg":"error"}');
  });

  it('should handle non-serializable error', async () => {
    const circularObj: Record<string, unknown> = {};
    circularObj.self = circularObj; // Create circular reference

    (sgMailVerify.send as jest.Mock).mockRejectedValue(circularObj);

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await SendVerificationEmail(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Failed to send email');
  });
});
