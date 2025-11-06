import middleware, * as MiddlewareModule from '../middleware';
import { NextRequest } from 'next/server';

jest.mock('@/lib/better-auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}));

// Move mock functions inside jest.mock to avoid hoisting issues
jest.mock('next/server', () => {
  const mockHeaders = {
    get: (key: string) =>
      key === 'location' ? '/signin?from=/dashboard' : null,
    set: jest.fn(),
  };
  return {
    NextResponse: {
      next: jest.fn(() => ({ headers: mockHeaders, status: 200 })),
      redirect: jest.fn((url: URL) => ({
        headers: mockHeaders,
        status: 307,
        url: url.toString(),
      })),
    },
  };
});

import { auth } from '@/lib/better-auth';
const mockGetSession = auth.api.getSession as unknown as jest.Mock;

// Helper to access the actual mocks
import { NextResponse } from 'next/server';
const mockNext = NextResponse.next as jest.Mock;
const mockRedirect = NextResponse.redirect as jest.Mock;

function createRequest(pathname: string): NextRequest {
  return {
    nextUrl: { pathname, origin: 'http://localhost' },
    headers: {},
  } as unknown as NextRequest;
}

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows _next static asset route', async () => {
    const request = createRequest('/_next/static/file.js');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('allows api/auth route', async () => {
    const request = createRequest('/api/auth/something');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('allows static route', async () => {
    const request = createRequest('/static/image.png');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('allows file route (contains .)', async () => {
    const request = createRequest('/favicon.ico');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('allows public route', async () => {
    const request = createRequest('/');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('allows another public route', async () => {
    const request = createRequest('/signin');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('allows protected route if authenticated', async () => {
    mockGetSession.mockResolvedValue({ user: { id: '1' } });
    const request = createRequest('/account');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('redirects to signin for protected route if not authenticated', async () => {
    mockGetSession.mockResolvedValue(null);
    const request = createRequest('/account');
    const response = await middleware(request);
    expect(mockRedirect).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.url).toContain('http://localhost/signin?from=%2Faccount');
  });

  it('redirects to signin for protected route if error thrown', async () => {
    mockGetSession.mockImplementation(() => {
      throw new Error('Auth error');
    });
    const request = createRequest('/account');
    const response = await middleware(request);
    expect(mockRedirect).toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.url).toContain('http://localhost/signin?from=%2Faccount');
  });

  it('allows non-public, non-protected route', async () => {
    const request = createRequest('/some-other-page');
    const response = await middleware(request);
    expect(mockNext).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it('exports config', () => {
    // ensure module-level `config` export is executed and counted by coverage
    expect(MiddlewareModule.config).toBeDefined();
  });

  it('exports runtime (loaded after mocks)', () => {
    // load the module in isolation after jest mocks so the runtime export is executed
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../middleware');
      expect(mod.runtime).toBeDefined();
    });
  });
});
