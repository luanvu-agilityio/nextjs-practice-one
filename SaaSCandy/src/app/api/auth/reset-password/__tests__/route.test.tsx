let POST: (
  request: NextRequest
) => Promise<{ json: () => Promise<unknown>; status: number }>;
import { NextRequest } from 'next/server';
import { hash } from '@node-rs/argon2';
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
      'Unexpected response shape'
    );
  });

  it('returns 500 if request.json throws', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect((data as { message: string }).message).toBe('Invalid JSON');
  });

  it('returns 500 if unexpected error thrown', async () => {
    (auth.api.resetPassword as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });
    const request = createMockRequest({
      token: 'reset-token-123',
      newPassword: 'newPassword123',
    });
    const response = await POST(request);
    const data = await response.json();
    expect(response.status).toBe(500);
    expect((data as { message: string }).message).toBe('Unexpected error');
  });
});
