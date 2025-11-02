#!/usr/bin/env node
/**
 * Verification script for Vercel deployment setup
 * Checks that all necessary configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Vercel deployment setup...\n');

let allGood = true;

// Check 1: Verify package.json scripts
console.log('1️⃣ Checking package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['vercel-build', 'postinstall'];
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    const scriptContent = packageJson.scripts[script];
    if (scriptContent.includes('schema.postgres.prisma')) {
      console.log(`   ✅ ${script}: Uses PostgreSQL schema`);
    } else {
      console.log(`   ⚠️  ${script}: May not use PostgreSQL schema`);
      allGood = false;
    }
  } else {
    console.log(`   ❌ ${script}: Missing`);
    allGood = false;
  }
});

// Check 2: Verify PostgreSQL schema exists
console.log('\n2️⃣ Checking Prisma schemas...');
const postgresSchema = 'prisma/schema.postgres.prisma';
if (fs.existsSync(postgresSchema)) {
  const schemaContent = fs.readFileSync(postgresSchema, 'utf8');
  if (schemaContent.includes('onboardingCompleted')) {
    console.log('   ✅ PostgreSQL schema has onboardingCompleted field');
  } else {
    console.log('   ❌ PostgreSQL schema missing onboardingCompleted field');
    allGood = false;
  }
  
  if (schemaContent.includes('model RiskTemplate')) {
    console.log('   ✅ PostgreSQL schema has RiskTemplate model');
  } else {
    console.log('   ⚠️  PostgreSQL schema missing RiskTemplate model');
  }
} else {
  console.log('   ❌ PostgreSQL schema file not found');
  allGood = false;
}

// Check 3: Verify SQL setup file exists
console.log('\n3️⃣ Checking setup files...');
const setupFiles = [
  'SETUP-SUPABASE-SQL.sql',
  'VERCEL-DEPLOYMENT-CHECKLIST.md'
];
setupFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
    allGood = false;
  }
});

// Check 4: Verify API routes exist
console.log('\n4️⃣ Checking API routes...');
const apiRoutes = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/me/route.ts',
  'src/app/api/auth/complete-onboarding/route.ts',
  'src/app/api/risk-templates/route.ts',
  'src/app/api/assessments/route.ts'
];
apiRoutes.forEach(route => {
  if (fs.existsSync(route)) {
    console.log(`   ✅ ${route}`);
  } else {
    console.log(`   ❌ ${route} missing`);
    allGood = false;
  }
});

// Check 5: Verify vercel.json exists
console.log('\n5️⃣ Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
  console.log('   ✅ vercel.json exists');
} else {
  console.log('   ⚠️  vercel.json not found (may use defaults)');
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed! Ready for deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Run SETUP-SUPABASE-SQL.sql in Supabase SQL Editor');
  console.log('2. Set environment variables in Vercel dashboard');
  console.log('3. Push code to trigger deployment');
} else {
  console.log('❌ Some checks failed. Please review above.');
}
console.log('='.repeat(50));

process.exit(allGood ? 0 : 1);

