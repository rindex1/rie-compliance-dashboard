# 🚀 Deploy to Vercel - Quick Guide

## Before Deploying

### 1. Update Database Schema

You need to push the new schema changes to your production database (Supabase/PostgreSQL):

```bash
# Make sure your DATABASE_URL points to production
export DATABASE_URL="your-production-postgres-url"

# Push schema changes (this will update the database structure)
npx prisma db push --schema prisma/schema.postgres.prisma
```

**What changed:**
- Added `LicensePlan` enum (SUPERUSER, ADMIN)
- Added `accountLimit` field to `License` model
- Added `assignedById` and account assignment tracking to `User` model

### 2. Commit Your Changes

```bash
git add .
git commit -m "Add license plans (SUPERUSER/ADMIN) with account limits and impersonation"
git push origin main
```

## Deploy to Vercel

### Option A: Auto-Deploy (GitHub Integration)

If you have GitHub integration set up:

1. Push to main branch:
   ```bash
   git push origin main
   ```

2. Vercel will automatically:
   - Detect the push
   - Run `npm run vercel-build` (which uses `schema.postgres.prisma`)
   - Deploy to production

### Option B: Manual Deploy via CLI

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Environment Variables in Vercel

Make sure these are set in **Vercel Dashboard > Settings > Environment Variables**:

### Required:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PROVISION_TOKEN=your-provision-token
```

### Optional:
```
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

## Post-Deployment Checklist

- [ ] Database schema updated (`npx prisma db push`)
- [ ] Environment variables configured in Vercel
- [ ] Test login functionality
- [ ] Test admin tool connection
- [ ] Verify license plans work (SUPERUSER/ADMIN)
- [ ] Test account limit enforcement
- [ ] Test impersonation feature

## Troubleshooting

### Schema Migration Errors

If you get errors about missing columns/enums:

```bash
# Connect to production database and manually verify
npx prisma studio --schema prisma/schema.postgres.prisma
```

### Build Errors

If build fails, check:
1. `DATABASE_URL` is set correctly in Vercel
2. Database is accessible from Vercel IPs
3. `schema.postgres.prisma` exists and is correct

### Test Deployment

After deployment:
1. Visit your Vercel URL
2. Try logging in with a test user
3. Use admin tool to create users and assign licenses
4. Verify SUPERUSER account limits work

