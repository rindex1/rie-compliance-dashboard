# Diagnosing Vercel "Interne serverfout" Errors

## Quick Diagnostic Endpoints

After deploying, test these endpoints to diagnose issues:

### 1. Health Check
```
GET https://your-app.vercel.app/api/health
```
This checks basic connectivity and environment setup.

### 2. Database Test
```
GET https://your-app.vercel.app/api/test-db
```
This tests database connection and schema.

### 3. Login Endpoint with Diagnostics
The login endpoint now includes diagnostic information in error responses.

## Common Issues and Fixes

### Issue 1: Prisma Client Not Generated for PostgreSQL

**Symptoms:**
- Error: "Unknown argument onboardingCompleted"
- Error: "column does not exist"

**Solution:**
The `postinstall` script should generate Prisma client from PostgreSQL schema, but sometimes it doesn't run. Check Vercel build logs.

**Fix:**
1. Verify `postinstall` script in package.json uses PostgreSQL schema
2. Check Vercel build logs for Prisma generation errors
3. Manually trigger Prisma generation if needed

### Issue 2: DATABASE_URL Not Set in Vercel

**Symptoms:**
- Error: "Database niet geconfigureerd"
- Health check shows `hasDatabaseUrl: false`

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your Supabase connection string
3. Redeploy

### Issue 3: Database Schema Out of Sync

**Symptoms:**
- Error: "column users.onboardingCompleted does not exist"
- Schema mismatch errors

**Solution:**
Run the SQL migration in Supabase:
```sql
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
```

### Issue 4: Wrong Prisma Schema Used

**Symptoms:**
- Prisma client generated for SQLite instead of PostgreSQL
- Type mismatches

**Solution:**
Ensure Vercel build uses `prisma/schema.postgres.prisma`:
- `vercel-build` script: ✅ Uses PostgreSQL schema
- `postinstall` script: ✅ Uses PostgreSQL schema

## Diagnostic Steps

1. **Check Health Endpoint:**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

2. **Check Database Connection:**
   ```bash
   curl https://your-app.vercel.app/api/test-db
   ```

3. **Check Login Error Details:**
   - Try logging in
   - Check browser console for detailed error response
   - Error response now includes diagnostic info

4. **Check Vercel Build Logs:**
   - Go to Vercel Dashboard → Deployments → Latest
   - Check for Prisma generation errors
   - Verify `postinstall` ran successfully

5. **Check Vercel Environment Variables:**
   - Settings → Environment Variables
   - Verify all required variables are set
   - Make sure they're set for "Production" environment

## Required Environment Variables

- `DATABASE_URL` - Supabase PostgreSQL connection string
- `JWT_SECRET` - Secure random string
- `JWT_EXPIRES_IN` - e.g., "7d"
- `NEXTAUTH_URL` - Your Vercel app URL
- `NEXTAUTH_SECRET` - Secure random string

