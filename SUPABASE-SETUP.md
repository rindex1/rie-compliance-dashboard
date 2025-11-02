# Supabase Database Setup Guide

## Prerequisites
- Supabase CLI installed: ✅ (already done)
- Supabase account: Create one at https://supabase.com if needed

## Step-by-Step Setup

### 1. Get Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click **Generate new token**
3. Give it a name (e.g., "CLI Access Token")
4. Copy the token (you'll only see it once!)

### 2. Login to Supabase CLI

Run this command in your terminal (you'll need to paste your token):
```bash
supabase login --token YOUR_ACCESS_TOKEN_HERE
```

Or set it as an environment variable:
```bash
export SUPABASE_ACCESS_TOKEN=your_token_here
supabase login
```

### 3. Create a New Supabase Project

```bash
cd "/Users/ramonsanders/Documents/untitled folder/rie-compliance-dashboard"
supabase projects create rie-compliance-db --region us-east-1 --org-id YOUR_ORG_ID
```

**To find your Org ID:**
- Go to https://supabase.com/dashboard
- Your org ID is in the URL or settings

**Or use the dashboard:**
1. Go to https://supabase.com/dashboard
2. Click **New Project**
3. Name: `rie-compliance-db`
4. Database password: (save this!)
5. Region: Choose closest to you
6. Click **Create new project**

### 4. Link Your Local Project to Supabase

```bash
cd "/Users/ramonsanders/Documents/untitled folder/rie-compliance-dashboard"
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your Project Ref:**
- Go to your project on https://supabase.com/dashboard
- Settings → General
- Reference ID is shown there (or it's in the project URL)

### 5. Push Your Prisma Schema to Supabase

First, generate a migration from your Prisma schema:

```bash
# Generate migration from Postgres schema
npx prisma migrate dev --schema prisma/schema.postgres.prisma --name init --create-only

# Apply migrations to Supabase
supabase db push
```

Or use Prisma directly with Supabase connection string:

```bash
# Get connection string from Supabase dashboard:
# Settings → Database → Connection string → URI (copy this)

# Set it temporarily and run migrations
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
npx prisma migrate deploy --schema prisma/schema.postgres.prisma
```

### 6. Get Database Connection String

**From Supabase Dashboard:**
1. Go to your project → Settings → Database
2. Under **Connection string**, select **URI**
3. Copy the connection string (replace `[YOUR-PASSWORD]` with your actual password)

**Or from CLI:**
```bash
supabase status
# Shows local connection strings

# For production, get from dashboard or:
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

### 7. Configure Vercel

**Add environment variables in Vercel:**

```bash
# Install Vercel CLI if not already
npm install -g vercel

# Add DATABASE_URL
vercel env add DATABASE_URL production
# Paste your Supabase connection string when prompted

# Add JWT_SECRET
vercel env add JWT_SECRET production
# Enter a strong random string

# Add JWT_EXPIRES_IN
vercel env add JWT_EXPIRES_IN production
# Enter: 7d

# Add PROVISION_TOKEN (for admin tool)
vercel env add PROVISION_TOKEN production
# Enter a strong random token (remember this!)
```

**Or via Vercel Dashboard:**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable for **Production** environment

### 8. Deploy to Vercel

```bash
vercel --prod
```

The build script will:
- Run `prisma migrate deploy --schema prisma/schema.postgres.prisma`
- Generate Prisma client
- Build and deploy your Next.js app

## Quick Reference Commands

```bash
# Check Supabase status
supabase status

# View linked project
supabase projects list

# Pull environment variables from Supabase
supabase secrets list

# Open Supabase Studio (local)
supabase studio

# Reset local database
supabase db reset
```

## Using Admin Tool with Supabase

1. **Open admin tool**
2. **Base URL**: `https://your-app.vercel.app` (your deployed Vercel URL)
3. **Provision Token**: The `PROVISION_TOKEN` you set in Vercel
4. **Create users**: Use the "Nieuwe gebruiker aanmaken" form
5. **Manage licenses**: Assign/update licenses for users

## Notes

- **Local dev** still uses SQLite (`prisma/schema.prisma`)
- **Production** uses Supabase Postgres (`prisma/schema.postgres.prisma`)
- All user profiles and licenses are stored in Supabase and managed via admin tool
- The web app pulls user data from Supabase on login

## Troubleshooting

**Can't login to CLI:**
- Make sure you copied the full access token
- Token expires after some time, generate a new one

**Can't link project:**
- Ensure you're logged in: `supabase login`
- Check project ref is correct: `supabase projects list`

**Migrations fail:**
- Check connection string has correct password
- Ensure database password matches what you set during project creation
- Try connecting with psql first to verify credentials

**Connection refused:**
- Check Supabase project is not paused (free tier pauses after inactivity)
- Wake it up from the dashboard if needed

