import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.POSTGRES_URL!;
export const db = drizzle(postgres(connectionString), { schema });
export * from './schema';
