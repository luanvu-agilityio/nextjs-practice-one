describe('auth-client coverage smoke', () => {
  it('loads module to exercise top-level initialization', async () => {
    // ensure the env is set to exercise the baseURL path
    process.env.NEXT_PUBLIC_APP_URL = 'https://coverage.test';
    // clear cached modules and ensure we import the real file
    jest.resetModules();
    // Provide lightweight mocks for external dependencies so the module can initialize
    // without pulling in the full better-auth runtime.
    jest.doMock('better-auth/react', () => {
      return {
        createAuthClient: (_opts: unknown) => ({
          signIn: jest.fn(),
          signUp: jest.fn(),
          signOut: jest.fn(),
          useSession: jest.fn(),
          getSession: jest.fn(),
          updateUser: jest.fn(),
          twoFactor: {
            enable: jest.fn(),
            disable: jest.fn(),
            verifyOtp: jest.fn(),
          },
        }),
      };
    });
    jest.doMock('better-auth/client/plugins', () => ({
      twoFactorClient: () => ({}),
    }));

    const mod = await import('../auth-client');
    // module should load without throwing and export something
    expect(mod).toBeDefined();
  });
});
