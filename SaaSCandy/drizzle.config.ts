import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { getConfig } from './src/lib/config';

config({ path: '.env.local' });
config({ path: '.env.development.local' });

// Load typed config and use it for DB credentials. Use top-level await so the
// config is resolved before exporting the Drizzle configuration.
const cfg = await getConfig();

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: cfg.DATABASE_URL || cfg.POSTGRES_URL || '',
  },
});
