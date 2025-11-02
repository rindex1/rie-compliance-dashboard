# ⚠️ IMPORTANT: Run this SQL in Supabase

Copy and paste this SQL into your **Supabase SQL Editor** to add the `onboardingCompleted` column:

```sql
-- Add onboardingCompleted column to users table
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- Update existing users to have onboardingCompleted = false
UPDATE "users" 
SET "onboardingCompleted" = false 
WHERE "onboardingCompleted" IS NULL;
```

## Steps:
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"
4. Paste the SQL above
5. Click "Run" (or press Cmd/Ctrl + Enter)

After running this, restart your Next.js dev server and try logging in again.

