import '@testing-library/jest-dom';

global.Request = jest.fn();
// @ts-expect-error: Response may not exist on global in the Node.js environment
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

// Mock better-auth/react so importing the real auth client module is safe
jest.mock('better-auth/react', () => ({
  createAuthClient: jest.fn(() => ({
    useSession: jest.fn(() => ({ data: null, isPending: false, error: null })),
    signIn: { email: jest.fn() },
    signUp: { email: jest.fn() },
    signOut: jest.fn(),
    getSession: jest.fn(),
    updateUser: jest.fn(),
    twoFactor: {
      enable: jest.fn(),
      disable: jest.fn(),
      verifyOtp: jest.fn(),
    },
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
