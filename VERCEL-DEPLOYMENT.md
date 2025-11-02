# Vercel Deployment Guide for RI&E Compliance Dashboard

## 🚀 Quick Deployment Steps

### 1. Prerequisites

- Vercel account ([vercel.com](https://vercel.com))
- PostgreSQL database (Supabase, Neon, or other)
- GitHub repository (optional, for auto-deploy)

### 2. Environment Variables Setup

**IMPORTANT**: Add these environment variables in Vercel Dashboard > Settings > Environment Variables:

#### Required Variables

```bash
# Database Connection (Required)
DATABASE_URL=postgresql://username:password@host:5432/rie_compliance_db

# JWT Authentication (Required - Generate a strong random secret!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Next.js (Optional but recommended)
NODE_ENV=production
```

#### Optional Variables

```bash
# App URL (for redirects)
APP_URL=https://your-app.vercel.app

# Email Configuration (for future features)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

### 3. Database Setup

**Before deploying, ensure your database is ready:**

1. Run migrations locally or on your database:
   ```bash
   npx prisma migrate deploy
   ```
   
2. Or if using a fresh database:
   ```bash
   npx prisma db push
   ```

3. Verify the `User` model has the `password` field:
   ```bash
   npx prisma studio
   ```

### 4. Deployment Methods

#### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Option B: Deploy via GitHub (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Deploy RI&E app with authentication"
   git push origin main
   ```

2. Import project in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Add environment variables in the setup

3. Vercel will automatically:
   - Build your app
   - Generate Prisma client (`prisma generate`)
   - Deploy to production
   - Set up SSL certificates

## 📊 Production Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database connection tested and working
- [ ] Prisma migrations applied to production database
- [ ] JWT_SECRET is a strong, random string (32+ characters)
- [ ] Custom domain setup (optional)
- [ ] SSL certificate verified (automatic with Vercel)
- [ ] Test login functionality and admin provisioning
- [ ] Verify user data isolation (companyId filtering)

## 🔐 Security Checklist

- [ ] JWT_SECRET is unique and secure (never commit to git)
- [ ] Database connection uses SSL
- [ ] Environment variables marked as "Production" in Vercel
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced (automatic with Vercel)

## 🔄 Update Process

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects changes via GitHub webhook
# 2. Runs `prisma generate && npm run build`
# 3. Deploys new version
# 4. Runs health checks
# 5. Sends deployment notification
```

## 🐛 Troubleshooting

### Build Fails

**Error: Prisma Client not generated**
- Solution: Build command includes `prisma generate`, but ensure DATABASE_URL is set

**Error: Database connection failed**
- Solution: Check DATABASE_URL format and ensure database allows connections from Vercel IPs

### Authentication Issues

**Error: JWT_SECRET not found**
- Solution: Add JWT_SECRET environment variable in Vercel dashboard

**Error: Unauthorized**
- Solution: Check that Authorization header is being sent with Bearer token

### Database Issues

**Error: Column 'password' does not exist**
- Solution: Run `npx prisma migrate deploy` on your production database

## 📝 Post-Deployment Steps

1. **Provision a User (Admin):**
   - Set `PROVISION_TOKEN` in Vercel env vars
   - Call `POST /api/auth/provision` with header `X-Provision-Token` and JSON body for the user and license
   - Verify a user and license are created in the DB

2. **Test Login:**
   - Log out
   - Log back in with credentials
   - Verify session persists

3. **Test Protected Routes:**
   - Try accessing `/dashboard` without logging in
   - Should redirect to `/login`

4. **Monitor:**
   - Check Vercel Analytics
   - Monitor function logs for API errors
   - Check database connection pool usage

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Next.js on Vercel](https://vercel.com/docs/concepts/next.js/overview)

## 💡 Tips

- Use Vercel's preview deployments for testing before production
- Set up Vercel Analytics for performance monitoring
- Enable Vercel Logs for debugging
- Use Vercel's Edge Functions for faster API responses
- Consider using Vercel Postgres for easier database management
