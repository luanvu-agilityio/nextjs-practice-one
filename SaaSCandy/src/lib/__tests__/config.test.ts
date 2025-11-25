/**
 * Tests for config.ts
 *
 * Covers:
 * - getConfig function reading from process.env
 * - Default value handling for optional fields
 * - AppConfigService export
 * - configEffect export
 * - configLayer export
 */

describe('config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getConfig', () => {
    it('should read all environment variables correctly', async () => {
      process.env.BETTER_AUTH_SECRET = 'test-secret';
      process.env.BETTER_AUTH_URL = 'https://test.com';
      process.env.NEXT_PUBLIC_APP_URL = 'https://app.test.com';
      process.env.NEXT_PUBLIC_API_BLOG_POSTS = 'https://blog.test.com';
      process.env.SENDGRID_API_KEY = 'sg-test-key';
      process.env.SENDGRID_FROM_EMAIL = 'test@test.com';
      process.env.TWILIO_ACCOUNT_SID = 'twilio-sid';
      process.env.TWILIO_AUTH_TOKEN = 'twilio-token';
      process.env.TWILIO_PHONE_NUMBER = '+1234567890';
      process.env.DATABASE_URL = 'postgres://test';
      process.env.POSTGRES_URL = 'postgres://test2';
      process.env.GOOGLE_CLIENT_ID = 'google-id';
      process.env.GOOGLE_CLIENT_SECRET = 'google-secret';
      process.env.GITHUB_ID = 'github-id';
      process.env.GITHUB_SECRET = 'github-secret';

      const { getConfig } = await import('../config');
      const config = await getConfig();

      expect(config.BETTER_AUTH_SECRET).toBe('test-secret');
      expect(config.BETTER_AUTH_URL).toBe('https://test.com');
      expect(config.NEXT_PUBLIC_APP_URL).toBe('https://app.test.com');
      expect(config.NEXT_PUBLIC_API_BLOG_POSTS).toBe('https://blog.test.com');
      expect(config.SENDGRID_API_KEY).toBe('sg-test-key');
      expect(config.SENDGRID_FROM_EMAIL).toBe('test@test.com');
      expect(config.TWILIO_ACCOUNT_SID).toBe('twilio-sid');
      expect(config.TWILIO_AUTH_TOKEN).toBe('twilio-token');
      expect(config.TWILIO_PHONE_NUMBER).toBe('+1234567890');
      expect(config.DATABASE_URL).toBe('postgres://test');
      expect(config.POSTGRES_URL).toBe('postgres://test2');
      expect(config.GOOGLE_CLIENT_ID).toBe('google-id');
      expect(config.GOOGLE_CLIENT_SECRET).toBe('google-secret');
      expect(config.GITHUB_ID).toBe('github-id');
      expect(config.GITHUB_SECRET).toBe('github-secret');
    });

    it('should use empty string defaults for required fields when env vars are missing', async () => {
      delete process.env.BETTER_AUTH_SECRET;
      delete process.env.BETTER_AUTH_URL;
      delete process.env.NEXT_PUBLIC_API_BLOG_POSTS;

      const { getConfig } = await import('../config');
      const config = await getConfig();

      expect(config.BETTER_AUTH_SECRET).toBe('');
      expect(config.BETTER_AUTH_URL).toBe('');
      expect(config.NEXT_PUBLIC_API_BLOG_POSTS).toBe('');
    });

    it('should handle undefined optional fields', async () => {
      delete process.env.NEXT_PUBLIC_APP_URL;
      delete process.env.SENDGRID_API_KEY;
      delete process.env.SENDGRID_FROM_EMAIL;
      delete process.env.TWILIO_ACCOUNT_SID;
      delete process.env.TWILIO_AUTH_TOKEN;
      delete process.env.TWILIO_PHONE_NUMBER;
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_URL;
      delete process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_SECRET;
      delete process.env.GITHUB_ID;
      delete process.env.GITHUB_SECRET;

      const { getConfig } = await import('../config');
      const config = await getConfig();

      expect(config.NEXT_PUBLIC_APP_URL).toBeUndefined();
      expect(config.SENDGRID_API_KEY).toBeUndefined();
      expect(config.SENDGRID_FROM_EMAIL).toBeUndefined();
      expect(config.TWILIO_ACCOUNT_SID).toBeUndefined();
      expect(config.TWILIO_AUTH_TOKEN).toBeUndefined();
      expect(config.TWILIO_PHONE_NUMBER).toBeUndefined();
      expect(config.DATABASE_URL).toBeUndefined();
      expect(config.POSTGRES_URL).toBeUndefined();
      expect(config.GOOGLE_CLIENT_ID).toBeUndefined();
      expect(config.GOOGLE_CLIENT_SECRET).toBeUndefined();
      expect(config.GITHUB_ID).toBeUndefined();
      expect(config.GITHUB_SECRET).toBeUndefined();
    });

    it('should return a config object with correct type', async () => {
      process.env.BETTER_AUTH_SECRET = 'secret';
      process.env.BETTER_AUTH_URL = 'https://auth.test';

      const { getConfig } = await import('../config');
      const config = await getConfig();

      expect(typeof config).toBe('object');
      expect(config).toHaveProperty('BETTER_AUTH_SECRET');
      expect(config).toHaveProperty('BETTER_AUTH_URL');
      expect(config).toHaveProperty('NEXT_PUBLIC_APP_URL');
      expect(config).toHaveProperty('NEXT_PUBLIC_API_BLOG_POSTS');
    });
  });

  describe('exports', () => {
    it('should export AppConfigService', async () => {
      const mod = await import('../config');
      expect(mod.AppConfigService).toBeDefined();
    });

    it('should export configEffect', async () => {
      const mod = await import('../config');
      expect(mod.configEffect).toBeDefined();
    });

    it('should export configLayer', async () => {
      const mod = await import('../config');
      expect(mod.configLayer).toBeDefined();
    });
  });
});
