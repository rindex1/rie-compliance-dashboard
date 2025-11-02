-- Migration script to convert license plan from String to Enum
-- Run this in Supabase SQL Editor before running prisma db push

-- Step 1: Create the LicensePlan enum
DO $$ BEGIN
    CREATE TYPE "LicensePlan" AS ENUM ('SUPERUSER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add a temporary column with the new enum type
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "plan_new" "LicensePlan";

-- Step 3: Migrate existing data (convert 'standard' or any existing values to SUPERUSER)
UPDATE "licenses" 
SET "plan_new" = CASE 
    WHEN "plan" = 'standard' OR "plan" = 'STANDARD' THEN 'SUPERUSER'::"LicensePlan"
    WHEN "plan" = 'admin' OR "plan" = 'ADMIN' THEN 'ADMIN'::"LicensePlan"
    WHEN "plan" = 'superuser' OR "plan" = 'SUPERUSER' THEN 'SUPERUSER'::"LicensePlan"
    ELSE 'SUPERUSER'::"LicensePlan"  -- Default fallback
END
WHERE "plan_new" IS NULL;

-- Step 4: Drop the old column
ALTER TABLE "licenses" DROP COLUMN IF EXISTS "plan";

-- Step 5: Rename the new column to the original name
ALTER TABLE "licenses" RENAME COLUMN "plan_new" TO "plan";

-- Step 6: Make the column NOT NULL (if needed)
ALTER TABLE "licenses" ALTER COLUMN "plan" SET NOT NULL;

-- Step 7: Add accountLimit column if it doesn't exist
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "accountLimit" INTEGER;

-- Step 8: Add assignedById column to users table if it doesn't exist
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;

-- Step 9: Create foreign key constraint for assignedById (optional, can be done by Prisma)
-- ALTER TABLE "users" ADD CONSTRAINT "users_assignedById_fkey" 
-- FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL;

