# Deploy to Vercel - Fix Login Error

## Issue
Login fails on Vercel with "Interne serverfout" because:
- Prisma client needs to be generated with PostgreSQL schema
- Database schema needs to match (already done)

## Fix Applied
✅ Updated `postinstall` script to use PostgreSQL schema
✅ `vercel-build` already uses correct schema

## Deploy Steps

### Option 1: Deploy via Git (Recommended)
```bash
git add .
git commit -m "Fix: Use PostgreSQL schema for Prisma client generation"
git push origin main
# Vercel will auto-deploy
```

### Option 2: Deploy via Vercel CLI
```bash
vercel --prod
```

## Verify Environment Variables in Vercel

Make sure these are set in **Vercel Dashboard → Settings → Environment Variables**:

✅ `DATABASE_URL` - Your Supabase PostgreSQL connection string  
✅ `JWT_SECRET` - Strong random secret (32+ characters)  
✅ `PROVISION_TOKEN` - Token for admin tool  
✅ `JWT_EXPIRES_IN` - (optional) Default: 7d  

## After Deployment

1. Wait for deployment to complete
2. Test login at: `https://your-app.vercel.app/login`
3. Use credentials:
   - Email: `varangian@admin.com`
   - Password: `password123`

The build will:
1. Generate Prisma client with PostgreSQL schema ✅
2. Build Next.js app ✅
3. Deploy to Vercel ✅

## Troubleshooting

If login still fails after deployment:
1. Check Vercel build logs for errors
2. Check Vercel function logs (Runtime Logs)
3. Verify DATABASE_URL is correct
4. Verify database schema is migrated (already done)

