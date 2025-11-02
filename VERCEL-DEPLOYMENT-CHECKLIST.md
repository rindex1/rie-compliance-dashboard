# ✅ Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Supabase Database Setup

**Run this SQL in Supabase SQL Editor** (file: `SETUP-SUPABASE-SQL.sql`):

```sql
-- Add onboardingCompleted column
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Create admin user if needed
INSERT INTO "users" ("id", "email", "name", "password", "role", "onboardingCompleted", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'varangian@admin.com',
    'Varangian',
    '$2b$12$XJuXO1PSOMD7EVlld.tKjOGoZ6hCU58dpckfD1tSf74xH6.8w4YJ2',
    'ADMIN',
    false,
    NOW(),
    NOW()
)
ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "password" = EXCLUDED."password",
    "role" = EXCLUDED."role",
    "updatedAt" = NOW();

-- Create admin license
INSERT INTO "licenses" ("id", "userId", "plan", "status", "accountLimit", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    u.id,
    'ADMIN'::"LicensePlan",
    'ACTIVE'::"LicenseStatus",
    NULL,
    NOW(),
    NOW()
FROM "users" u
WHERE u.email = 'varangian@admin.com'
ON CONFLICT ("userId") DO UPDATE SET
    "plan" = EXCLUDED."plan",
    "status" = EXCLUDED."status",
    "updatedAt" = NOW();
```

### 2. Vercel Environment Variables

Set these in your Vercel project settings (Settings → Environment Variables):

**Required:**
- `DATABASE_URL` - Your Supabase PostgreSQL connection string
  - Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`
- `JWT_SECRET` - A secure random string (at least 32 characters)
- `JWT_EXPIRES_IN` - `7d` (or your preferred expiration)
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., `https://rie-compliance-dashboard.vercel.app`)
- `NEXTAUTH_SECRET` - A secure random string (at least 32 characters)

**Optional:**
- `PROVISION_TOKEN` - Token for admin provisioning API (set a secure random value)

### 3. Verify Build Configuration

The `package.json` already has:
- ✅ `vercel-build` script: `prisma generate --schema prisma/schema.postgres.prisma && next build`
- ✅ `postinstall` script: `prisma generate --schema prisma/schema.postgres.prisma`

This ensures Prisma client is generated for PostgreSQL during deployment.

## Post-Deployment Verification

After deploying to Vercel:

1. **Test Login:**
   - Go to: `https://your-app.vercel.app/login`
   - Login with: `varangian@admin.com` / `password123`
   - Should redirect to `/rie/new` (wizard) if `onboardingCompleted = false`

2. **Check Build Logs:**
   - In Vercel dashboard, verify build succeeded
   - Check that Prisma client generated without errors

3. **Test API Endpoints:**
   - `/api/auth/login` - Should return user with `onboardingCompleted`
   - `/api/auth/me` - Should return user data
   - `/api/risk-templates` - Should return templates (if seeded)

## Troubleshooting

### Issue: "Column onboardingCompleted does not exist"
**Solution:** Run the SQL migration in Supabase (Step 1)

### Issue: "Cannot connect to database"
**Solution:** Check `DATABASE_URL` environment variable in Vercel

### Issue: "Prisma client not generated"
**Solution:** Verify `postinstall` script runs and uses PostgreSQL schema

### Issue: Login redirects to dashboard instead of wizard
**Solution:** Check that user has `onboardingCompleted = false` in database

## Quick Verification SQL

Run this in Supabase to verify setup:

```sql
-- Check if column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'onboardingCompleted';

-- Check admin user
SELECT email, name, role, "onboardingCompleted" 
FROM users 
WHERE email = 'varangian@admin.com';

-- Check admin license
SELECT u.email, l.plan, l.status 
FROM users u
JOIN licenses l ON l."userId" = u.id
WHERE u.email = 'varangian@admin.com';
```

