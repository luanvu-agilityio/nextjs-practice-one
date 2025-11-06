/* eslint-disable @typescript-eslint/consistent-type-imports */
// Mock external modules used by better-auth.ts so the top-level code executes.
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

jest.mock('better-auth', () => ({
  betterAuth: jest.fn((opts: unknown) => ({ $Infer: { Session: { user: { id: 'x' } } } })),
}));

jest.mock('better-auth/adapters/drizzle', () => ({ drizzleAdapter: jest.fn(() => 'adapter') }));
jest.mock('better-auth/plugins', () => ({ twoFactor: jest.fn(() => ({})) }));
jest.mock('../db', () => ({ db: {} }));

jest.mock('@/constants/email-template', () => ({
  PasswordChangedAlertEmail: jest.fn(() => '<html/>'),
  ResetPasswordEmail: jest.fn(() => '<html/>'),
  VerificationEmail: jest.fn(() => '<html/>'),
}));

describe('better-auth bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('initializes betterAuth and sets sendgrid api key', async () => {
    process.env.SENDGRID_API_KEY = 'SOME_KEY';
    process.env.BETTER_AUTH_SECRET = 'SECRET';
    process.env.BETTER_AUTH_URL = 'http://x';

  const sg = await import('@sendgrid/mail');
    const better = await import('better-auth');

    // import the module under test; this will call betterAuth and sgMail.setApiKey
    const mod = await import('../better-auth');

    expect(typeof mod.auth).toBe('object');
    expect(better.betterAuth).toHaveBeenCalled();
    expect(sg.default.setApiKey).toHaveBeenCalledWith('SOME_KEY');
  });
});
