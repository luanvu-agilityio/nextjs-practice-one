import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { getConfig } from '../config';

// initialize the neon client using the typed config (server-side)
const cfg = await getConfig();
const sql = neon(cfg.DATABASE_URL || cfg.POSTGRES_URL || '');
export const db = drizzle({ client: sql, schema });

export * from './schema';
