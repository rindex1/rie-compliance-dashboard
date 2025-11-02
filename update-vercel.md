# Update Vercel with Supabase - Quick Steps

## Step 1: Update Supabase Database Schema

You need to push the new schema changes to Supabase first:

### Option A: Using the Script (Easiest)
```bash
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
./deploy-supabase.sh
```

### Option B: Manual Command
```bash
# Set your Supabase connection string
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Push schema changes
npx prisma db push --schema prisma/schema.postgres.prisma --accept-data-loss
```

**Get your Supabase connection string:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → Database → Connection string → URI
4. Replace `[YOUR-PASSWORD]` with your database password

## Step 2: Verify Schema Changes

After pushing, verify the changes in Supabase:
- Go to Supabase Dashboard → Table Editor
- Check that `licenses` table has:
  - `plan` column (enum: SUPERUSER, ADMIN)
  - `accountLimit` column (integer, nullable)
- Check that `users` table has:
  - `assignedById` column (text, nullable)

## Step 3: Deploy to Vercel

### Option A: Auto-Deploy (if GitHub connected)
```bash
git add .
git commit -m "Add license plans with account limits"
git push origin main
# Vercel auto-deploys
```

### Option B: Manual Deploy
```bash
vercel --prod
```

## Step 4: Verify Environment Variables in Vercel

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

✅ `DATABASE_URL` - Your Supabase PostgreSQL connection string  
✅ `JWT_SECRET` - Strong random secret (32+ characters)  
✅ `PROVISION_TOKEN` - Token for admin tool authentication  
✅ `JWT_EXPIRES_IN` - (optional) Default: 7d  

## Step 5: Test After Deployment

1. Visit your Vercel URL
2. Test login with an existing user
3. Use admin tool to:
   - Create new users with SUPERUSER/ADMIN plans
   - Assign account limits to SUPERUSER plans
   - Test impersonation feature

