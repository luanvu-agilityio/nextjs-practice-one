import { TextEncoder } from 'util';
(global as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
  TextEncoder;
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

// Mock dependencies
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

describe('/api/auth/update-profile', () => {
  const createMockRequest = (body: Record<string, unknown>) => {
    return {
      json: jest.fn().mockResolvedValue(body),
      headers: new Headers(),
    } as unknown as NextRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({ name: 'Test User' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });

  it('should require name field', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
    });

    const request = createMockRequest({ name: '' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Name is required');
  });
});

describe('/api/auth/update-profile', () => {
  const createMockRequest = (body: Record<string, unknown>) =>
    ({
      json: jest.fn().mockResolvedValue(body),
      headers: new Headers(),
    }) as unknown as NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should require authentication', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue(null);

    const request = createMockRequest({ name: 'Test User' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.message).toBe('Unauthorized');
  });

  it('should require name field', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
    });

    const request = createMockRequest({ name: '' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Name is required');
  });

  it('should error if email already in use', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
    });

    const { db } = await import('@/lib/db');
    (db.query.user.findFirst as jest.Mock).mockResolvedValue({
      id: '2',
      email: 'taken@example.com',
    });

    const request = createMockRequest({
      name: 'Test User',
      email: 'taken@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.message).toBe('Email already in use');
  });

  it('should update profile when email is unchanged', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'test@example.com' },
    });

    const { db } = await import('@/lib/db');
    // when checking existing user for new email, return null (not found)
    (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);

    const request = {
      json: jest.fn().mockResolvedValue({ name: 'Updated User' }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Profile updated successfully');
    expect(data.success).toBe(true);
  });

  it('should update profile when changing to a new unique email', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValue({
      user: { id: '1', email: 'old@example.com' },
    });

    const { db } = await import('@/lib/db');
    // simulate existingUser check returns null (email not taken)
    (db.query.user.findFirst as jest.Mock).mockResolvedValue(null);

    const request = {
      json: jest
        .fn()
        .mockResolvedValue({ name: 'New Name', email: 'new@example.com' }),
      headers: new Headers(),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Profile updated successfully');
    expect(data.success).toBe(true);
  });

  it('should handle unexpected errors', async () => {
    const { auth } = await import('@/lib/better-auth');
    (auth.api.getSession as unknown as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected');
    });

    const request = createMockRequest({ name: 'Test User' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.message).toBe('Unexpected');
  });
});
