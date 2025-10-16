import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Create database file in project root
const dbPath = path.join(process.cwd(), 'saascandy.db');
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
export * from './schema';
