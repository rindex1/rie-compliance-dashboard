#!/bin/bash

# Deploy Schema to Supabase
# This script pushes the updated Prisma schema to your Supabase database

echo "🚀 Deploying schema to Supabase..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it with your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'"
    echo ""
    echo "You can find this in Supabase Dashboard > Settings > Database > Connection string > URI"
    exit 1
fi

echo "✅ DATABASE_URL found"
echo "📦 Pushing schema changes to Supabase..."

# Push schema to Supabase
npx prisma db push --schema prisma/schema.postgres.prisma --accept-data-loss

if [ $? -eq 0 ]; then
    echo "✅ Schema successfully pushed to Supabase!"
    echo ""
    echo "Schema changes applied:"
    echo "  - Added LicensePlan enum (SUPERUSER, ADMIN)"
    echo "  - Added accountLimit column to licenses table"
    echo "  - Added assignedById column to users table"
    echo ""
    echo "Next step: Deploy to Vercel with 'vercel --prod'"
else
    echo "❌ Failed to push schema. Please check the error above."
    exit 1
fi

