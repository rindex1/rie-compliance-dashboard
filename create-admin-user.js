/* eslint-disable */
/**
 * Script to create admin user in Supabase
 * Usage: node create-admin-user.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Generate Prisma client - make sure to run with PostgreSQL schema
// First run: npx prisma generate --schema prisma/schema.postgres.prisma
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user "varangian"...');
    
    // Get password from environment or prompt
    const password = process.env.ADMIN_PASSWORD || process.argv[2];
    
    if (!password) {
      console.error('❌ Error: Password required');
      console.log('Usage: ADMIN_PASSWORD=yourpassword node create-admin-user.js');
      console.log('   OR: node create-admin-user.js yourpassword');
      process.exit(1);
    }

    const email = 'varangian@admin.com';
    const name = 'Varangian';
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('⚠️  User already exists. Updating...');
      
      // Update existing user
      const user = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
        },
        select: { id: true, email: true, name: true, role: true },
      });

      // Ensure license exists and is ADMIN plan
      await prisma.license.upsert({
        where: { userId: user.id },
        update: {
          plan: 'ADMIN',
          status: 'ACTIVE',
          accountLimit: null, // ADMIN has unlimited
        },
        create: {
          userId: user.id,
          plan: 'ADMIN',
          status: 'ACTIVE',
          accountLimit: null,
        },
      });

      console.log('✅ User updated successfully!');
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   License: ADMIN (unlimited accounts)`);
    } else {
      // Create new user
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role: 'ADMIN',
          },
          select: { id: true, email: true, name: true, role: true },
        });

        const license = await tx.license.create({
          data: {
            userId: user.id,
            plan: 'ADMIN',
            status: 'ACTIVE',
            accountLimit: null, // ADMIN has unlimited accounts
          },
        });

        return { user, license };
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${result.user.email}`);
      console.log(`   Name: ${result.user.name}`);
      console.log(`   Role: ${result.user.role}`);
      console.log(`   License: ${result.license.plan} (unlimited accounts)`);
      console.log('\n🎉 You can now log in with:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: [the password you provided]`);
    }

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (error.code === 'P2002') {
      console.error('   User with this email already exists');
    } else if (error.code === 'P3005') {
      console.error('   Database schema not ready. Run migrations first.');
    } else {
      console.error('   Details:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

