-- Create admin user "varangian" in Supabase
-- Run this in Supabase SQL Editor

-- Step 1: Add missing column if needed
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "accountLimit" INTEGER;

-- Step 2: Create LicensePlan enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "LicensePlan" AS ENUM ('SUPERUSER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create or update admin user
-- Note: This uses bcrypt hash for password 'password123'
-- Hash generated with: bcrypt.hash('password123', 12)
INSERT INTO "users" ("id", "email", "name", "password", "role", "createdAt", "updatedAt", "assignedById")
VALUES (
    gen_random_uuid()::text,
    'varangian@admin.com',
    'Varangian',
    '$2b$12$XJuXO1PSOMD7EVlld.tKjOGoZ6hCU58dpckfD1tSf74xH6.8w4YJ2', -- password123
    'ADMIN',
    NOW(),
    NOW(),
    NULL
)
ON CONFLICT ("email") 
DO UPDATE SET
    "password" = EXCLUDED."password",
    "role" = EXCLUDED."role",
    "updatedAt" = NOW();

-- Step 4: Create or update license for the user
INSERT INTO "licenses" ("id", "userId", "plan", "status", "accountLimit", "createdAt", "updatedAt", "expiresAt")
SELECT 
    gen_random_uuid()::text,
    u.id,
    'ADMIN'::"LicensePlan",
    'ACTIVE',
    NULL, -- NULL = unlimited for ADMIN
    NOW(),
    NOW(),
    NULL
FROM "users" u
WHERE u.email = 'varangian@admin.com'
ON CONFLICT ("userId")
DO UPDATE SET
    "plan" = 'ADMIN'::"LicensePlan",
    "status" = 'ACTIVE',
    "accountLimit" = NULL,
    "updatedAt" = NOW();

-- Verify the user was created
SELECT u.id, u.email, u.name, u.role, l.plan, l.status 
FROM "users" u
LEFT JOIN "licenses" l ON l."userId" = u.id
WHERE u.email = 'varangian@admin.com';

