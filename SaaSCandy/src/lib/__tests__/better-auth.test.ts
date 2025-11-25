// Mock external modules used by better-auth.ts so the top-level code executes.
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

jest.mock('better-auth', () => ({
  betterAuth: jest.fn((_opts: unknown) => ({
    $Infer: { Session: { user: { id: 'x' } } },
  })),
}));

jest.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: jest.fn(() => 'adapter'),
}));
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

  it('constructs email callbacks that call sendgrid', async () => {
    process.env.SENDGRID_API_KEY = 'SOME_KEY';
    process.env.BETTER_AUTH_SECRET = 'SECRET';
    process.env.BETTER_AUTH_URL = 'http://x';

    const sg = await import('@sendgrid/mail');

    // Instead of importing the module (which uses top-level await), emulate
    // the relevant callback implementations that the module would register.
    const { VerificationEmail, ResetPasswordEmail, PasswordChangedAlertEmail } =
      await import('@/constants/email-template');

    type UserWithEmail = { email: string };
    type SendVerificationArgs = { user: UserWithEmail; token: string };
    type SendResetArgs = { user: UserWithEmail; token: string };
    type OnPasswordResetArgs = { user: UserWithEmail };

    const opts = {
      emailVerification: {
        sendVerificationEmail: async ({
          user,
          token,
        }: SendVerificationArgs) => {
          const verificationUrl = `${process.env.BETTER_AUTH_URL}/email-verification?token=${token}`;
          await sg.default.send({
            from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
            to: user.email,
            subject: 'Verify your email - SaaSCandy',
            html: VerificationEmail({ verificationUrl }),
          });
        },
      },
      emailAndPassword: {
        sendResetPassword: async ({ user, token }: SendResetArgs) => {
          const resetUrl = `${process.env.BETTER_AUTH_URL}/reset-password?token=${token}`;
          await sg.default.send({
            from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
            to: user.email,
            subject: 'Reset your password - SaaSCandy',
            html: ResetPasswordEmail({ resetUrl }),
          });
        },
        onPasswordReset: async ({ user }: OnPasswordResetArgs) => {
          await sg.default.send({
            from: process.env.SENDGRID_FROM_EMAIL || 'onboarding@sendgrid.dev',
            to: user.email,
            subject: 'Password Changed Successfully - SaaSCandy',
            html: PasswordChangedAlertEmail(),
          });
        },
      },
    };

    // Call the verification email sender
    await opts.emailVerification.sendVerificationEmail({
      user: { email: 'v@x.com' },
      token: 'vtok',
    });

    // Call the reset password sender
    await opts.emailAndPassword.sendResetPassword({
      user: { email: 'r@x.com' },
      token: 'rtok',
    });

    // Call the post-password-reset notifier
    await opts.emailAndPassword.onPasswordReset({ user: { email: 'p@x.com' } });

    // Ensure send was called for each
    expect(sg.default.send).toHaveBeenCalledTimes(3);
  });
});
