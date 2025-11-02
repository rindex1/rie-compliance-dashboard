# Setup Admin User "varangian" in Supabase

## Step 1: Migrate Database Schema (if not done yet)

If you haven't run the SQL migration yet:

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `migrate-license-plan.sql`
3. Then run: `npx prisma db push --schema prisma/schema.postgres.prisma`

## Step 2: Create Admin User

### Option A: Using the Script (Recommended)

```bash
# Make sure DATABASE_URL is set to your Supabase connection
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run with password as argument
node create-admin-user.js your-secure-password-here

# OR set it as environment variable (more secure)
ADMIN_PASSWORD=your-secure-password-here node create-admin-user.js
```

This will create:
- **Email**: `varangian@admin.com`
- **Name**: `Varangian`
- **Role**: `ADMIN`
- **License**: `ADMIN` plan (unlimited accounts)

### Option B: Using Admin Tool

1. Open admin tool: `cd admin-tool && npm run start`
2. Set Base URL to your Supabase/Vercel URL (or localhost:3000 if running locally)
3. Set Provision Token (from your `.env` or Vercel environment)
4. Create user with:
   - Name: `Varangian`
   - Email: `varangian@admin.com`
   - Password: [your password]
   - Role: `ADMIN`
   - License: Plan `ADMIN`, Status `ACTIVE`

### Option C: Using API Directly

```bash
curl -X POST http://localhost:3000/api/auth/provision \
  -H "Content-Type: application/json" \
  -H "X-Provision-Token: your-provision-token" \
  -d '{
    "email": "varangian@admin.com",
    "name": "Varangian",
    "password": "your-secure-password",
    "role": "ADMIN",
    "license": {
      "plan": "ADMIN",
      "status": "ACTIVE"
    }
  }'
```

## Step 3: Verify User Created

Check in Supabase Dashboard → Table Editor:
- ✅ User exists in `users` table
- ✅ License exists in `licenses` table with `ADMIN` plan

## Step 4: Login

You can now log in with:
- **Email**: `varangian@admin.com`
- **Password**: [the password you set]

## Features Available

With ADMIN license, you can:
- ✅ Impersonate any user
- ✅ Create unlimited accounts
- ✅ Manage all users and licenses
- ✅ Access all features without restrictions

