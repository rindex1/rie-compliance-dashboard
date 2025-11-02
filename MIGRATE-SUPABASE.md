# Migrate Supabase Schema - License Plan Update

## ⚠️ Important: Manual Migration Required

The `plan` column in the `licenses` table needs to be converted from String to Enum. This requires a manual migration.

## Step 1: Run SQL Migration in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Create a new query
5. Copy and paste the contents of `migrate-license-plan.sql`
6. Click **Run** to execute the migration

This will:
- Create the `LicensePlan` enum type
- Convert existing `plan` values (e.g., "standard") to enum values (SUPERUSER/ADMIN)
- Add `accountLimit` column to `licenses` table
- Add `assignedById` column to `users` table

## Step 2: Push Remaining Schema Changes

After running the SQL migration, push the schema:

```bash
npx prisma db push --schema prisma/schema.postgres.prisma
```

## Step 3: Verify Changes

Check in Supabase Dashboard → Table Editor:
- ✅ `licenses.plan` is now an enum (SUPERUSER/ADMIN)
- ✅ `licenses.accountLimit` exists (integer, nullable)
- ✅ `users.assignedById` exists (text, nullable)

## Step 4: Deploy to Vercel

Once schema is updated:
```bash
vercel --prod
```

## Alternative: If You Don't Have Existing Data

If you don't mind losing data, you can reset:

```bash
npx prisma db push --schema prisma/schema.postgres.prisma --force-reset
```

⚠️ **Warning**: This will delete all existing data!

