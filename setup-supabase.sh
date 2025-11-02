#!/bin/bash
# Script to set up Supabase database with Prisma migrations

echo "🚀 Setting up Supabase database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not set. Please set it first:"
  echo "   export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
  echo ""
  echo "Or add it to .env.local:"
  echo "   echo 'DATABASE_URL=\"your-connection-string\"' >> .env.local"
  exit 1
fi

echo "✅ DATABASE_URL found"

# Generate Prisma client for Postgres schema
echo "📦 Generating Prisma client..."
npx prisma generate --schema prisma/schema.postgres.prisma

# Push schema to Supabase
echo "🗄️  Running migrations on Supabase..."
npx prisma migrate deploy --schema prisma/schema.postgres.prisma

# Verify connection
echo "🔍 Verifying database connection..."
npx prisma db pull --schema prisma/schema.postgres.prisma

echo "✅ Setup complete! Your Supabase database is ready."
echo ""
echo "Next steps:"
echo "1. Add DATABASE_URL to Vercel environment variables"
echo "2. Add JWT_SECRET, JWT_EXPIRES_IN, PROVISION_TOKEN to Vercel"
echo "3. Deploy: vercel --prod"

