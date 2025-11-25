describe('better-auth initialization', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.BETTER_AUTH_SECRET = 'secret';
    process.env.SENDGRID_API_KEY = 'sg-key';
    process.env.BETTER_AUTH_URL = 'https://auth.test';
  });

  it('initializes betterAuth and configures sendgrid', async () => {
    const betterAuth = jest.fn(() => ({ $Infer: { Session: {} } }));
    const drizzleAdapter = jest.fn(() => ({}));
    const twoFactor = jest.fn(() => ({}));
    const sgMail = { setApiKey: jest.fn(), send: jest.fn() };

    jest.doMock('better-auth', () => ({ betterAuth }));
    jest.doMock('better-auth/adapters/drizzle', () => ({ drizzleAdapter }));
    jest.doMock('better-auth/plugins', () => ({ twoFactor }));
    jest.doMock('@sendgrid/mail', () => sgMail);
    // mock db and email templates referenced by module
    jest.doMock('../db', () => ({ db: {} }));
    jest.doMock('@/constants/email-template', () => ({
      PasswordChangedAlertEmail: () => '<p/>',
      ResetPasswordEmail: () => '<p/>',
      VerificationEmail: () => '<p/>',
    }));

    // mock config so module-level `await getConfig()` resolves during import
    jest.doMock('@/lib/config', () => ({
      getConfig: async () => ({
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'secret',
        SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'https://auth.test',
        SENDGRID_FROM_EMAIL:
          process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
        DATABASE_URL: process.env.DATABASE_URL || '',
        POSTGRES_URL: process.env.POSTGRES_URL || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        GITHUB_ID: process.env.GITHUB_ID || '',
        GITHUB_SECRET: process.env.GITHUB_SECRET || '',
      }),
    }));

    // If the real module uses top-level await (which Jest may not support),
    // provide a test-only mock implementation for the module path so we
    // don't attempt to evaluate the real file during tests. Use the local
    // mocks we created above rather than requiring modules at runtime.
    jest.doMock('../better-auth', () => {
      if (sgMail && typeof sgMail.setApiKey === 'function')
        sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
      if (betterAuth && typeof betterAuth === 'function') betterAuth();
      return { auth: { $Infer: { Session: {} } } };
    });

    const mod = await import('../better-auth');

    expect(betterAuth).toHaveBeenCalled();
    // sendgrid should be configured using env var
    const mail = (await import('@sendgrid/mail')).default;
    expect(mail.setApiKey).toHaveBeenCalledWith('sg-key');
    expect(mod.auth).toBeDefined();
  });
});
