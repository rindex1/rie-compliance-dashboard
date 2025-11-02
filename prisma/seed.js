/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 12);

  // Create or get company
  const company = await prisma.company.upsert({
    where: { id: 'seed-company-1' },
    update: {},
    create: {
      id: 'seed-company-1',
      name: 'Example BV',
      country: 'Netherlands',
    },
  });

  // Users to seed
  const users = [
    { email: 'admin@example.com', name: 'Alice Admin', role: 'ADMIN' },
    { email: 'manager@example.com', name: 'Marty Manager', role: 'MANAGER' },
    { email: 'employee@example.com', name: 'Eve Employee', role: 'EMPLOYEE' },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password,
        role: u.role,
        companyId: company.id,
      },
    });

    // Assign appropriate plans: ADMIN for admin user, SUPERUSER for others
    const plan = u.role === 'ADMIN' ? 'ADMIN' : 'SUPERUSER';
    const accountLimit = plan === 'SUPERUSER' ? 10 : null; // Example: SUPERUSER gets 10 account limit

    await prisma.license.upsert({
      where: { userId: user.id },
      update: {
        plan,
        status: 'ACTIVE',
        accountLimit: accountLimit,
        expiresAt: null,
      },
      create: {
        userId: user.id,
        plan,
        status: 'ACTIVE',
        accountLimit: accountLimit,
      },
    });
  }

  console.log('Seed completed. Users: admin@example.com, manager@example.com, employee@example.com');
  console.log('Password for all: Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


