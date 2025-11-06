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

    const mod = await import('../better-auth');

    expect(betterAuth).toHaveBeenCalled();
    // sendgrid should be configured using env var
    const mail = await import('@sendgrid/mail');
    expect(mail.setApiKey).toHaveBeenCalledWith('sg-key');
    expect(mod.auth).toBeDefined();
  });
});
