import { GET, POST } from '../route';

// Mock better-auth
jest.mock('@/lib/better-auth', () => ({
  auth: {
    handler: jest.fn(),
  },
}));

jest.mock('better-auth/next-js', () => ({
  toNextJsHandler: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}));

describe('/api/auth/[...all] route', () => {
  it('should export GET and POST handlers', () => {
    expect(GET).toBeDefined();
    expect(POST).toBeDefined();
    expect(typeof GET).toBe('function');
    expect(typeof POST).toBe('function');
  });
});
