import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only initialize Prisma if DATABASE_URL is configured
export const prisma = globalForPrisma.prisma ?? 
  (process.env.DATABASE_URL ? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  }) : null as any);

if (process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma;
}

// Log connection status in development
if (process.env.NODE_ENV === 'development') {
  console.log('Prisma initialized:', {
    hasPrisma: !!prisma,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlFormat: process.env.DATABASE_URL?.substring(0, 20) + '...',
  });
}
