-- Complete Supabase Setup SQL
-- Run this in Supabase SQL Editor to set up everything for Vercel deployment

-- ============================================
-- 1. Add onboardingCompleted column
-- ============================================
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

UPDATE "users" 
SET "onboardingCompleted" = false 
WHERE "onboardingCompleted" IS NULL;

-- ============================================
-- 2. Ensure LicensePlan enum exists
-- ============================================
DO $$ BEGIN
    CREATE TYPE "LicensePlan" AS ENUM ('SUPERUSER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 3. Ensure risk_templates table exists (will be created by Prisma, but just in case)
-- ============================================
-- Note: Prisma will create this table during deployment
-- This is just a safety check

-- ============================================
-- 4. Create or update admin user "varangian"
-- ============================================
INSERT INTO "users" ("id", "email", "name", "password", "role", "onboardingCompleted", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'varangian@admin.com',
    'Varangian',
    '$2b$12$XJuXO1PSOMD7EVlld.tKjOGoZ6hCU58dpckfD1tSf74xH6.8w4YJ2', -- password123 (bcrypt hash)
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
    "updatedAt" = NOW()
RETURNING "id", "email", "name", "role";

-- ============================================
-- 5. Create or update admin license for varangian
-- ============================================
INSERT INTO "licenses" ("id", "userId", "plan", "status", "accountLimit", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    u.id,
    'ADMIN'::"LicensePlan",
    'ACTIVE'::"LicenseStatus",
    NULL, -- Unlimited for ADMIN
    NOW(),
    NOW()
FROM "users" u
WHERE u.email = 'varangian@admin.com'
ON CONFLICT ("userId") DO UPDATE SET
    "plan" = EXCLUDED."plan",
    "status" = EXCLUDED."status",
    "accountLimit" = EXCLUDED."accountLimit",
    "updatedAt" = NOW()
RETURNING "plan", "status", "accountLimit";

-- ============================================
-- 6. Verify setup
-- ============================================
SELECT 
    u.email,
    u.name,
    u.role,
    u."onboardingCompleted",
    l.plan as license_plan,
    l.status as license_status
FROM "users" u
LEFT JOIN "licenses" l ON l."userId" = u.id
WHERE u.email = 'varangian@admin.com';

