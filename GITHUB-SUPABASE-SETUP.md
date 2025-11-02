# Connecting Supabase via GitHub

## Option 1: Supabase GitHub Integration (Recommended)

If you want to use GitHub OAuth for Supabase authentication:

1. **In Supabase Dashboard:**
   - Go to your project → Authentication → Providers
   - Enable **GitHub** provider
   - Add your GitHub OAuth App credentials

2. **Get Connection String:**
   - Settings → Database → Connection string (URI)
   - Copy the connection string (still use regular Postgres connection, not OAuth for database)

## Option 2: Link Supabase Project via GitHub

If you want to link your Supabase project to your GitHub repo:

1. **In Supabase Dashboard:**
   - Go to Settings → Integrations → GitHub
   - Connect your GitHub account
   - Link your repository

2. **Get Database Connection String:**
   - Settings → Database → Connection string (URI)
   - This is what you need for DATABASE_URL

## For Database Connection

**Important:** The database connection string is always a Postgres URI, regardless of GitHub integration:

Format:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

You can find this in:
- Supabase Dashboard → Settings → Database → Connection string → URI

## Next Steps

Once you have the connection string:

1. **Add to Vercel:**
   ```bash
   vercel env add DATABASE_URL production
   # Paste your Supabase Postgres connection string
   ```

2. **Run migrations:**
   ```bash
   export DATABASE_URL="your-connection-string-here"
   npx prisma migrate deploy --schema prisma/schema.postgres.prisma
   ```

3. **Configure other env vars:**
   ```bash
   vercel env add JWT_SECRET production
   vercel env add PROVISION_TOKEN production
   vercel env add JWT_EXPIRES_IN production
   ```

The GitHub integration is mainly for authentication (if you want users to log in with GitHub) or for CI/CD, but the database connection itself uses the standard Postgres connection string.

