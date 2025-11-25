jest.mock('@sendgrid/mail');
jest.mock('@/constants/email-template', () => ({
  VerificationEmail: jest.fn(() => '<html>Verify</html>'),
}));

jest.mock('@/lib/config', () => ({
  getConfig: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

jest.mock('effect', () => ({
  Effect: {
    promise: function* (fn: () => Promise<unknown>) {
      return yield fn();
    },
    gen: (genFn: () => Generator) => genFn,
    runPromise: async (genFn: () => Generator) => {
      const generator = genFn();
      let result = generator.next();
      let lastValue;

      while (!result.done) {
        if (result.value && typeof result.value.next === 'function') {
          const nestedGenerator = result.value;
          let nestedResult = nestedGenerator.next();
          while (!nestedResult.done) {
            if (typeof nestedResult.value === 'function') {
              try {
                lastValue = await nestedResult.value();
              } catch (error) {
                nestedResult = nestedGenerator.throw(error);
                continue;
              }
            } else {
              lastValue = await Promise.resolve(nestedResult.value);
            }
            nestedResult = nestedGenerator.next(lastValue);
          }
          lastValue = nestedResult.value;
        } else if (typeof result.value === 'function') {
          try {
            lastValue = await result.value();
          } catch (error) {
            result = generator.throw(error);
            continue;
          }
        } else {
          lastValue = await Promise.resolve(result.value);
        }
        result = generator.next(lastValue);
      }

      return result.value;
    },
  },
}));

import sgMailVerify from '@sendgrid/mail';
import type { NextRequest } from 'next/server';
import { handleSendVerification, POST } from '../route';
import { getConfig } from '@/lib/config';

describe('POST /api/auth/send-verification-email', () => {
  const mockConfig = {
    SENDGRID_API_KEY: 'test-key',
    SENDGRID_FROM_EMAIL: 'test@example.com',
    BETTER_AUTH_URL: 'http://localhost:3000',
  };

  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully send verification email', async () => {
    (sgMailVerify.send as jest.Mock).mockResolvedValue([
      { statusCode: 202, body: 'sent' },
    ]);

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await handleSendVerification(request, mockConfig);
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

    const response = await handleSendVerification(request, mockConfig);
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

    const response = await handleSendVerification(request, mockConfig);
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

    const response = await handleSendVerification(request, mockConfig);
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

    const response = await handleSendVerification(request, mockConfig);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Failed to send email');
  });

  it('should use default from email when SENDGRID_FROM_EMAIL is missing', async () => {
    (sgMailVerify.send as jest.Mock).mockResolvedValue([
      { statusCode: 202, body: 'sent' },
    ]);

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const configWithoutFromEmail = {
      SENDGRID_API_KEY: 'test-key',
      SENDGRID_FROM_EMAIL: '',
      BETTER_AUTH_URL: 'http://localhost:3000',
    };

    const response = await handleSendVerification(
      request,
      configWithoutFromEmail
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(sgMailVerify.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'onboarding@sendgrid.dev',
      })
    );
  });

  it('should not set API key when SENDGRID_API_KEY is missing', async () => {
    const setApiKeySpy = jest.spyOn(sgMailVerify, 'setApiKey');
    (sgMailVerify.send as jest.Mock).mockResolvedValue([
      { statusCode: 202, body: 'sent' },
    ]);

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const configWithoutApiKey = {
      SENDGRID_FROM_EMAIL: 'test@example.com',
      BETTER_AUTH_URL: 'http://localhost:3000',
    };

    await handleSendVerification(request, configWithoutApiKey);

    expect(setApiKeySpy).not.toHaveBeenCalled();
  });

  it('should call POST wrapper successfully', async () => {
    (getConfig as jest.Mock).mockResolvedValue(mockConfig);
    (sgMailVerify.send as jest.Mock).mockResolvedValue([
      { statusCode: 202, body: 'sent' },
    ]);

    const request = createMockRequest({
      email: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(getConfig).toHaveBeenCalled();
  });
});
