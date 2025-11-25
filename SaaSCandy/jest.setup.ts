import '@testing-library/jest-dom';

global.Request = jest.fn();
// @ts-expect-error: Response may not exist on global in the Node.js environment
global.Response = jest.fn();
global.Headers = jest.fn();
global.fetch = jest.fn();

// Polyfill TextEncoder/TextDecoder for packages that expect browser globals
// (the `effect` package uses TextEncoder internally). Node provides these
// under the `util` module; expose them on the global object for Jest.
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined')
  // @ts-ignore: Node's TextEncoder type is compatible enough for tests
  global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === 'undefined')
  // @ts-ignore: Node's TextDecoder type may differ from lib.dom, ignore for tests
  global.TextDecoder = TextDecoder;

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
// Manual mocks for Better Auth are provided under `__mocks__/better-auth/*`.
// This allows Jest to load the package mocks automatically.

// Mock @neondatabase/serverless
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(),
}));

// Mock your auth client specifically
// Note: do NOT mock `@/lib/auth-client` here so tests can exercise it directly.
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
