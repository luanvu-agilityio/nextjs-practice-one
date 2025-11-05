# Database Migration Guide

## Overview
After refactoring to use Better Auth's built-in password reset, the `user.resetToken` and `user.resetTokenExpires` columns are no longer needed.

## Migration Steps

### 1. Verify No Active Reset Tokens
```sql
-- Check for any active reset tokens before migration
SELECT 
  id, 
  email, 
  resetToken IS NOT NULL as has_token,
  resetTokenExpires
FROM "user"
WHERE resetToken IS NOT NULL;
```

**Action**: If any users have active tokens, wait until they expire (1 hour) or notify them to request a new reset.

---

### 2. Generate Migration

```bash
# Navigate to project directory
cd "d:\github deployment\nextjs\nextjs-practice-one\SaaSCandy"

# Generate migration
pnpm drizzle-kit generate
```

This will create a migration file in `drizzle/` directory with SQL to drop the columns.

---

### 3. Review Migration

Open the generated migration file (e.g., `drizzle/0003_xxx.sql`) and verify:

```sql
ALTER TABLE "user" DROP COLUMN IF EXISTS "resetToken";
ALTER TABLE "user" DROP COLUMN IF EXISTS "resetTokenExpires";
```

---

### 4. Test in Development

```bash
# Apply migration to development database
pnpm drizzle-kit push
```

Test password reset flow to ensure it works without these columns.

---

### 5. Apply to Staging

```bash
# Set staging database URL
export DATABASE_URL="your-staging-db-url"

# Push migration
pnpm drizzle-kit push
```

Test all auth flows in staging environment.

---

### 6. Backup Production

Before applying to production:

```bash
# Connect to production database and create backup
pg_dump -h your-host -U your-user -d your-db > backup-$(date +%Y%m%d).sql
```

---

### 7. Apply to Production

```bash
# Set production database URL
export DATABASE_URL="your-production-db-url"

# Push migration
pnpm drizzle-kit push
```

---

### 8. Verify Production

After migration:

```sql
-- Verify columns are dropped
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'user' 
  AND column_name IN ('resetToken', 'resetTokenExpires');

-- Should return 0 rows

-- Verify verification table exists (used by Better Auth)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'verification';

-- Should show: id, identifier, value, expiresAt, type, createdAt, updatedAt
```

---

### 9. Test Production

1. Request password reset for test account
2. Check Vercel logs for: `[better-auth] ℹ️ Token stored in verification table`
3. Click reset link in email
4. Submit new password
5. Check logs for: `[reset-password] ✅ Password reset successful`
6. Sign in with new password

---

## Rollback (If Needed)

If issues arise, restore columns:

```sql
ALTER TABLE "user" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "user" ADD COLUMN "resetTokenExpires" TIMESTAMP;
```

Then revert code changes:
```bash
git revert <commit-hash>
```

---

## Important Notes

1. **No Data Loss**: User passwords are stored in `account` table (untouched)
2. **Better Auth Handles Tokens**: Uses `verification` table instead
3. **Backward Compatible**: Old reset links will simply expire (they used user.resetToken)
4. **New Flow Only**: After migration, only new reset requests will work

---

## Alternative: Soft Migration

If you prefer to keep columns temporarily:

1. Leave columns in schema (they'll just be NULL)
2. Monitor for a few weeks
3. Verify no issues
4. Then drop columns

To keep columns, simply don't run the migration and remove the TODO comment in `schema.ts`.
