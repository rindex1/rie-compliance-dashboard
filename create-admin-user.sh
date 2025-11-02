#!/bin/bash

# Script to create admin user "varangian"
# Usage: ./create-admin-user.sh yourpassword

if [ -z "$1" ]; then
    echo "❌ Error: Password required"
    echo "Usage: ./create-admin-user.sh yourpassword"
    exit 1
fi

PASSWORD="$1"

# Make sure Prisma client is generated for PostgreSQL
echo "📦 Generating Prisma client for PostgreSQL..."
npx prisma generate --schema prisma/schema.postgres.prisma

# Run the script with password
echo "👤 Creating admin user..."
ADMIN_PASSWORD="$PASSWORD" node create-admin-user.js

