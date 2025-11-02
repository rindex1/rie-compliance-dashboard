-- Quick migration: Add missing columns first
-- Run this in Supabase SQL Editor if schema migration hasn't been done yet

-- Add assignedById column to users table (if it doesn't exist)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;

-- Add accountLimit column to licenses table (if it doesn't exist)
ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "accountLimit" INTEGER;

-- If plan column exists as text and needs to be enum, run the full migration script
-- Otherwise, if plan doesn't exist yet, we'll let Prisma create it

