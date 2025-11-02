# Vercel Deployment Setup

## Step 1: Update Supabase Database Schema

Run this SQL in your **Supabase SQL Editor** to add the `onboardingCompleted` column:

```sql
-- Add onboardingCompleted column to users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to have onboardingCompleted = false
UPDATE "users" 
SET "onboardingCompleted" = false 
WHERE "onboardingCompleted" IS NULL;
```

## Step 2: Seed Risk Templates in Supabase

After running the SQL above, you can optionally seed the risk templates. However, for production, you might want to do this via the application or manually.

To seed via script (requires DATABASE_URL to be set locally):
```bash
DATABASE_URL="your-supabase-connection-string" npm run seed:risks
```

Or run the seed script directly with your Supabase connection:
```bash
node prisma/seed-risks.js
```

## Step 3: Verify Vercel Environment Variables

Make sure these are set in your Vercel project settings:

- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `JWT_SECRET` - A secure random secret
- `JWT_EXPIRES_IN` - e.g., "7d"
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., https://rie-compliance-dashboard.vercel.app)
- `NEXTAUTH_SECRET` - A secure random secret

## Step 4: Test Login

1. Go to your Vercel deployment URL
2. Try logging in with: `varangian@admin.com` / `password123`
3. You should be redirected to the RI&E wizard if `onboardingCompleted = false`

## Step 5: Verify Admin User Exists

If `varangian@admin.com` doesn't exist, you can create it by running this SQL in Supabase:

```sql
-- Create admin user "varangian" if it doesn't exist
INSERT INTO "users" ("id", "email", "name", "password", "role", "onboardingCompleted", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'varangian@admin.com',
    'Varangian',
    '$2b$12$XJuXO1PSOMD7EVlld.tKjOGoZ6hCU58dpckfD1tSf74xH6.8w4YJ2', -- password123
    'ADMIN',
    false,
    NOW(),
    NOW()
)
ON CONFLICT ("email") DO UPDATE SET
    "name" = EXCLUDED."name",
    "password" = EXCLUDED."password",
    "role" = EXCLUDED."role",
    "onboardingCompleted" = EXCLUDED."onboardingCompleted",
    "updatedAt" = NOW();

-- Create or update admin license
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
    "accountLimit" = EXCLUDED."accountLimit",
    "updatedAt" = NOW();
```

## Verification Checklist

- [ ] `onboardingCompleted` column added to users table
- [ ] Admin user exists and can log in
- [ ] Vercel environment variables are set
- [ ] Build completes successfully on Vercel
- [ ] Login redirects to wizard for new users

