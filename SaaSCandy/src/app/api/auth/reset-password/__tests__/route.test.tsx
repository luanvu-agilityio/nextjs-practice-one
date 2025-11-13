let POST: (
  request: NextRequest
) => Promise<{ json: () => Promise<unknown>; status: number }>;
import { NextRequest } from 'next/server';
import { hash } from '@node-rs/argon2';
import { auth } from '@/lib/better-auth';
// mock getFriendlyMessage used in the catch handler
jest.mock('@/components', () => ({
  getFriendlyMessage: jest.fn(),
}));
import { getFriendlyMessage } from '@/components';

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

jest.mock('@/lib/better-auth', () => ({
  auth: {
    api: {
      resetPassword: jest.fn(),
    },
  },
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
    // require the route after mocks are configured so it uses the mocked dependencies
    jest.isolateModules(() => {
      import('../route').then(mod => {
        POST = mod.POST;
      });
    });
  });

  it('returns 400 if token is missing', async () => {
    const request = createMockRequest({ newPassword: 'newPassword123' });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { message: string }).message).toBe(
      'Token and new password required'
    );
  });

  it('returns 400 if newPassword is missing', async () => {
    const request = createMockRequest({ token: 'reset-token-123' });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { message: string }).message).toBe(
      'Token and new password required'
    );
  });

  it('returns 400 if newPassword is not a string', async () => {
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 12345,
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { message: string }).message).toBe(
      'Token and new password required'
    );
  });

  it('returns 200 and success if resetPassword returns ok', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      message: 'Password updated',
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect((data as { success: boolean }).success).toBe(true);
    expect((data as { message: string }).message).toBe('Password updated');
  });

  it('returns 200 and uses fallback message when success has no message', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      ok: true,
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect((data as { success: boolean }).success).toBe(true);
    expect((data as { message: string }).message).toBe(
      'Password updated successfully'
    );
  });

  it('returns 200 and success if resetPassword returns success', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Password updated',
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect((data as { success: boolean }).success).toBe(true);
    expect((data as { message: string }).message).toBe('Password updated');
  });

  it('returns 200 and success if resetPassword returns user', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      user: { id: 'user-1' },
      message: 'Password updated',
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect((data as { success: boolean }).success).toBe(true);
    expect((data as { message: string }).message).toBe('Password updated');
  });

  it('returns 400 if resetPassword returns error', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      error: 'Reset failed',
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { success: boolean }).success).toBe(false);
    expect((data as { message: string }).message).toBe('Reset failed');
  });

  it('returns 400 if resetPassword returns message only', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      message: 'Something went wrong',
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { success: boolean }).success).toBe(false);
    expect((data as { message: string }).message).toBe('Something went wrong');
  });

  it('returns 400 if resetPassword returns unexpected shape', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      foo: 'bar',
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { message: string }).message).toBe(
      'Invalid or expired token'
    );
  });

  it('returns 500 if request.json throws', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(500);
    // route.ts uses getFriendlyMessage(err) || 'Failed to reset password'
    // when getFriendlyMessage returns undefined, the fallback is used
    (getFriendlyMessage as jest.Mock).mockReturnValue(undefined);
    expect((data as { message: string }).message).toBe(
      'Failed to reset password'
    );
  });

  it('returns 500 if unexpected error thrown', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    // simulate getFriendlyMessage providing a nicer message before calling POST
    (getFriendlyMessage as jest.Mock).mockReturnValue('Nice friendly message');
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect((data as { message: string }).message).toBe('Nice friendly message');
  });

  it('returns 400 if request.json resolves to null (no body)', async () => {
    const request = {
      json: jest.fn().mockResolvedValue(null),
    } as unknown as NextRequest;
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { message: string }).message).toBe(
      'Token and new password required'
    );
  });

  it('handles resetPassword returning numeric truthy status', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      status: 1,
      message: 'Numeric status success',
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    // route checks `resetResult?.status === true` so numeric 1 is not === true
    expect(response.status).toBe(400);
    expect((data as { message: string }).message).toBe(
      'Numeric status success'
    );
  });

  it('handles resetPassword returning falsy status and no message', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockResolvedValue({
      status: false,
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(400);
    expect((data as { message: string }).message).toBe(
      'Invalid or expired token'
    );
  });
});
