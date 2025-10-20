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
    },
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(),
      })),
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
