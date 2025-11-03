// For SMS 2FA codes
export const smsVerificationCode = pgTable('smsVerificationCode', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  phone: text('phone').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  verified: boolean('verified').default(false),
  attempts: text('attempts').default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  // Password is stored on the `account` table for credential providers.
  // Keep this nullable to avoid insert failures when the auth adapter
  // creates a user record without a password field.
  password: text('password'),
  phone: text('phone'), // Optional phone for SMS 2FA
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  twoFactorEnabled: boolean('twoFactorEnabled').default(false),
  resetToken: text('resetToken'),
  resetTokenExpires: timestamp('resetTokenExpires'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  type: text('type').notNull().default('email'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// For DEMO/LEARNING purposes only - stores verification codes
// In production, use proper token-based verification
export const emailVerificationCode = pgTable('emailVerificationCode', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  code: text('code').notNull(),
  // For DEMO: Store plain password temporarily for easier testing
  tempPassword: text('tempPassword'),
  expiresAt: timestamp('expiresAt').notNull(),
  verified: boolean('verified').default(false),
  attempts: text('attempts').default('0'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
