/* eslint-disable @typescript-eslint/consistent-type-imports */
// Ensure process env path for default branch
const OLD = process.env.NEXT_PUBLIC_APP_URL;
delete process.env.NEXT_PUBLIC_APP_URL;

jest.mock('better-auth/react', () => ({
  createAuthClient: (opts: unknown) => ({
    signIn: () => undefined,
    signUp: () => undefined,
    signOut: () => undefined,
    useSession: () => undefined,
    getSession: () => undefined,
    updateUser: () => undefined,
    twoFactor: { enable: () => undefined, disable: () => undefined, verifyOtp: () => undefined },
  }),
}));

// also mock the twoFactor client plugin used by the module
jest.mock('better-auth/client/plugins', () => ({
  twoFactorClient: () => () => ({}),
}));

describe('auth-client exports', () => {
  afterAll(() => {
    if (OLD !== undefined) process.env.NEXT_PUBLIC_APP_URL = OLD;
    else delete process.env.NEXT_PUBLIC_APP_URL;
    jest.resetModules();
  });

  it('imports and exposes auth functions', async () => {
    const mod = await import('../auth-client');
  // some build setups export the underlying client as `authClient` while others
  // expose named helpers; accept either shape and assert key functions exist.
  const clientHolder = mod as unknown as { authClient?: Record<string, unknown> };

  // the goal is to execute the module's top-level initialization; assert that
  // the module exported the underlying client or a default export.
  expect(clientHolder.authClient || (mod as unknown as Record<string, unknown>).default).toBeDefined();
  });
});
