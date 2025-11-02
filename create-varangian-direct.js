/* eslint-disable */
/**
 * Direct SQL script to create admin user in Supabase
 * This bypasses Prisma and executes SQL directly
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function createVarangianUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database');

    // Step 1: Add missing columns
    console.log('📦 Adding missing columns...');
    await client.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "assignedById" TEXT;
      ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "accountLimit" INTEGER;
    `);

    // Step 2: Create LicensePlan enum
    console.log('📦 Creating LicensePlan enum...');
    await client.query(`
      DO $$ BEGIN
          CREATE TYPE "LicensePlan" AS ENUM ('SUPERUSER', 'ADMIN');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

    // Step 3: Convert plan column if it exists as text
    console.log('📦 Checking license plan column...');
    const columnCheck = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'licenses' AND column_name = 'plan';
    `);

    if (columnCheck.rows.length > 0 && columnCheck.rows[0].data_type === 'text') {
      console.log('🔄 Converting plan column from text to enum...');
      // Add temporary column
      await client.query(`
        ALTER TABLE "licenses" ADD COLUMN IF NOT EXISTS "plan_new" "LicensePlan";
      `);
      // Migrate data
      await client.query(`
        UPDATE "licenses" 
        SET "plan_new" = CASE 
            WHEN "plan" = 'standard' OR "plan" = 'STANDARD' THEN 'SUPERUSER'::"LicensePlan"
            WHEN "plan" = 'admin' OR "plan" = 'ADMIN' THEN 'ADMIN'::"LicensePlan"
            WHEN "plan" = 'superuser' OR "plan" = 'SUPERUSER' THEN 'SUPERUSER'::"LicensePlan"
            ELSE 'SUPERUSER'::"LicensePlan"
        END
        WHERE "plan_new" IS NULL;
      `);
      // Drop old column
      await client.query(`ALTER TABLE "licenses" DROP COLUMN IF EXISTS "plan";`);
      // Rename new column
      await client.query(`ALTER TABLE "licenses" RENAME COLUMN "plan_new" TO "plan";`);
      await client.query(`ALTER TABLE "licenses" ALTER COLUMN "plan" SET NOT NULL;`);
    } else if (columnCheck.rows.length === 0) {
      // Column doesn't exist, add it
      console.log('📦 Adding plan column...');
      await client.query(`
        ALTER TABLE "licenses" ADD COLUMN "plan" "LicensePlan" NOT NULL DEFAULT 'SUPERUSER'::"LicensePlan";
      `);
    }

    // Step 4: Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Step 5: Create or update user
    console.log('👤 Creating admin user...');
    const userResult = await client.query(`
      INSERT INTO "users" ("id", "email", "name", "password", "role", "createdAt", "updatedAt", "assignedById")
      VALUES (
          gen_random_uuid()::text,
          $1,
          $2,
          $3,
          $4,
          NOW(),
          NOW(),
          NULL
      )
      ON CONFLICT ("email") 
      DO UPDATE SET
          "password" = EXCLUDED."password",
          "role" = EXCLUDED."role",
          "updatedAt" = NOW()
      RETURNING "id", "email", "name", "role";
    `, ['varangian@admin.com', 'Varangian', hashedPassword, 'ADMIN']);

    const user = userResult.rows[0];
    console.log('✅ User created/updated:', user);

    // Step 6: Create or update license
    console.log('📄 Creating admin license...');
    const licenseResult = await client.query(`
      INSERT INTO "licenses" ("id", "userId", "plan", "status", "accountLimit", "createdAt", "updatedAt", "expiresAt")
      VALUES (
          gen_random_uuid()::text,
          $1,
          'ADMIN'::"LicensePlan",
          'ACTIVE',
          NULL,
          NOW(),
          NOW(),
          NULL
      )
      ON CONFLICT ("userId")
      DO UPDATE SET
          "plan" = 'ADMIN'::"LicensePlan",
          "status" = 'ACTIVE',
          "accountLimit" = NULL,
          "updatedAt" = NOW()
      RETURNING "plan", "status", "accountLimit";
    `, [user.id]);

    const license = licenseResult.rows[0];
    console.log('✅ License created/updated:', license);

    console.log('\n🎉 Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: varangian@admin.com');
    console.log('Password: password123');
    console.log('Role: ADMIN');
    console.log('License: ADMIN (unlimited accounts)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === '42704') {
      console.error('   Hint: Type or column might not exist. Check database schema.');
    } else if (error.code === '23505') {
      console.error('   Hint: User already exists.');
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.log('Please set it with your Supabase connection string:');
  console.log('export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"');
  process.exit(1);
}

createVarangianUser();

