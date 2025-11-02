-- Add onboardingCompleted column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to have onboardingCompleted = false (they can complete it if they want)
UPDATE "users" 
SET "onboardingCompleted" = false 
WHERE "onboardingCompleted" IS NULL;

