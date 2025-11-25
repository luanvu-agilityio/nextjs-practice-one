import { Layer, Config, Context } from 'effect';

export type AppConfig = {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_API_BLOG_POSTS: string;
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  DATABASE_URL?: string;
  POSTGRES_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_ID?: string;
  GITHUB_SECRET?: string;
};

const AppConfigSpec = Config.all({
  BETTER_AUTH_SECRET: Config.string(),
  BETTER_AUTH_URL: Config.string(),
  NEXT_PUBLIC_APP_URL: Config.string(),
  NEXT_PUBLIC_API_BLOG_POSTS: Config.string(),
  SENDGRID_API_KEY: Config.string(),
  SENDGRID_FROM_EMAIL: Config.string(),
  TWILIO_ACCOUNT_SID: Config.string(),
  TWILIO_AUTH_TOKEN: Config.string(),
  TWILIO_PHONE_NUMBER: Config.string(),
  DATABASE_URL: Config.string(),
  POSTGRES_URL: Config.string(),
  GOOGLE_CLIENT_ID: Config.string(),
  GOOGLE_CLIENT_SECRET: Config.string(),
  GITHUB_ID: Config.string(),
  GITHUB_SECRET: Config.string(),
});

export const configEffect = AppConfigSpec;

// Create a Context Tag so the AppConfig can be provided/consumed as a service.
class AppConfigService extends Context.Tag('AppConfig')<
  AppConfigService,
  AppConfig
>() {}

// Layer that provides the AppConfig to Effects via the service Tag.
export const configLayer = Layer.effect(AppConfigService, configEffect);

// Export the Tag so Effects can consume the config via `Effect.service(AppConfigService)`.
export { AppConfigService };

// Convenience helper for non-Effect code (e.g., Next.js route handlers)
export async function getConfig(): Promise<AppConfig> {
  // Avoid running Effect runtime at module import/build time.
  // Read directly from process.env and return a minimal typed config.
  const env = process.env;

  const cfg: AppConfig = {
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET || '',
    BETTER_AUTH_URL: env.BETTER_AUTH_URL || '',
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_BLOG_POSTS: env.NEXT_PUBLIC_API_BLOG_POSTS || '',
    SENDGRID_API_KEY: env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: env.SENDGRID_FROM_EMAIL,
    TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: env.TWILIO_PHONE_NUMBER,
    DATABASE_URL: env.DATABASE_URL,
    POSTGRES_URL: env.POSTGRES_URL,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET,
    GITHUB_ID: env.GITHUB_ID,
    GITHUB_SECRET: env.GITHUB_SECRET,
  };

  return cfg;
}
