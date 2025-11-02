# Vercel Postgres Database Setup Guide

## Quick Setup via Vercel CLI

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Your Project (if not already linked)
```bash
cd "/Users/ramonsanders/Documents/untitled folder/rie-compliance-dashboard"
vercel link
```

### 4. Add Vercel Postgres Storage
```bash
vercel storage add postgres
```

This will:
- Create a Postgres database for your project
- Automatically add `POSTGRES_URL` environment variable to your Vercel project
- Set up the connection string

**Note:** If `vercel storage add` doesn't work, use the Vercel dashboard:
1. Go to your project on vercel.com
2. Click **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. This will automatically set `POSTGRES_URL`

### 5. Pull Environment Variables Locally
```bash
vercel env pull .env.local
```

This creates/updates `.env.local` with `POSTGRES_URL` from Vercel.

### 6. Update Local .env.local
You need to set `DATABASE_URL` to match Vercel's `POSTGRES_URL`:

```bash
# After pulling env vars, check what POSTGRES_URL is
# Then set DATABASE_URL to the same value in .env.local
```

Or manually copy `POSTGRES_URL` to `DATABASE_URL` in `.env.local`:
```env
DATABASE_URL="${POSTGRES_URL}"
```

### 7. Set Production Environment Variables in Vercel
```bash
# Set JWT_SECRET
vercel env add JWT_SECRET production
# Enter a strong random string when prompted

# Set JWT_EXPIRES_IN
vercel env add JWT_EXPIRES_IN production
# Enter: 7d

# Set PROVISION_TOKEN (for admin tool)
vercel env add PROVISION_TOKEN production
# Enter a strong random token (remember this for admin tool!)
```

### 8. Run Migrations on Production Database
```bash
# First, pull the production DATABASE_URL
vercel env pull .env.production

# Run migrations using Postgres schema
DATABASE_URL=$(grep POSTGRES_URL .env.production | cut -d '=' -f2) \
  npx prisma migrate deploy --schema prisma/schema.postgres.prisma
```

Or deploy to Vercel and it will run migrations automatically during build.

### 9. Deploy to Production
```bash
vercel --prod
```

The build script will:
- Run `prisma migrate deploy --schema prisma/schema.postgres.prisma`
- Generate Prisma client with Postgres schema
- Build and deploy your Next.js app

## Alternative: Neon (Postgres) CLI Setup

If you prefer Neon, which also has great CLI support:

```bash
# Install Neon CLI
npm install -g @neondatabase/cli

# Login
neon auth

# Create project and database
neon projects create --name rie-compliance-db
neon databases create --project-id <your-project-id>

# Get connection string
neon connection-string <project-id>

# Add to Vercel
vercel env add DATABASE_URL production
# Paste the connection string
```

## Using the Admin Tool with Production

1. Open admin tool
2. **Base URL**: `https://your-app.vercel.app`
3. **Provision Token**: The `PROVISION_TOKEN` you set in step 7 above
4. Create your first admin user
5. Users can now log in to the web app!

## Notes

- **Local dev** still uses SQLite (`prisma/schema.prisma`)
- **Production** uses Postgres (`prisma/schema.postgres.prisma`)
- The `vercel-build` script automatically handles migrations on deploy
- Your desktop admin tool connects to the production API to manage users/licenses

