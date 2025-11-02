#!/usr/bin/env node
/**
 * Verify that Prisma client is generated correctly for PostgreSQL
 * Run this during build to ensure correct schema is used
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Prisma Client...\n');

// Check if Prisma client exists
const prismaClientPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client', 'index.d.ts');
if (!fs.existsSync(prismaClientPath)) {
  console.error('❌ Prisma client not found!');
  console.error('   Run: npx prisma generate --schema prisma/schema.postgres.prisma');
  process.exit(1);
}

// Check if the client was generated for PostgreSQL (check for PostgreSQL-specific types)
const clientContent = fs.readFileSync(prismaClientPath, 'utf8');

// Check for onboardingCompleted field
if (!clientContent.includes('onboardingCompleted')) {
  console.error('❌ Prisma client missing onboardingCompleted field!');
  console.error('   The client may be generated from the wrong schema.');
  console.error('   Run: npx prisma generate --schema prisma/schema.postgres.prisma');
  process.exit(1);
}

// Check for RiskTemplate model
if (!clientContent.includes('RiskTemplate')) {
  console.warn('⚠️  Prisma client missing RiskTemplate model');
  console.warn('   This might be okay if not yet migrated.');
}

console.log('✅ Prisma client verified');
console.log('   - Client exists');
console.log('   - onboardingCompleted field present');
if (clientContent.includes('RiskTemplate')) {
  console.log('   - RiskTemplate model present');
}

process.exit(0);

