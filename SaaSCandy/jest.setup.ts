import '@testing-library/jest-dom';

global.Request = jest.fn();
global.Response = jest.fn();
global.Headers = jest.fn();
global.fetch = jest.fn();

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/signin',
}));
jest.mock('nanostores', () => ({
  atom: jest.fn(),
  map: jest.fn(),
  computed: jest.fn(),
  onMount: jest.fn(),
}));
jest.mock('better-auth/client', () => ({
  createAuthClient: jest.fn(() => ({
    useSession: jest.fn(),
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() },
    signOut: jest.fn(),
  })),
}));

// Mock @neondatabase/serverless
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(),
}));
// Mock Better Auth completely
jest.mock('better-auth/client', () => ({
  createAuthClient: jest.fn(() => ({
    useSession: jest.fn(() => ({
      data: null,
      isPending: false,
      error: null,
    })),
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() },
    signOut: jest.fn(),
  })),
}));

jest.mock('better-auth/client/plugins', () => ({
  twoFactorClient: jest.fn(() => ({})),
}));

// Mock your auth client specifically
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: jest.fn(() => ({
      data: null,
      isPending: false,
      error: null,
    })),
  },
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
    error: null,
  })),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));
