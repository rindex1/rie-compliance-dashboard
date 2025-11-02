import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Simple health check endpoint to diagnose connection issues
export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    // Check if Prisma client exists
    const hasPrisma = !!prisma;
    
    // Try a simple database query
    let dbConnection = false;
    let dbError = null;
    
    if (prisma) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        dbConnection = true;
      } catch (error: any) {
        dbError = error.message || String(error);
      }
    }
    
    // Check Prisma schema being used
    const schemaPath = process.env.PRISMA_SCHEMA_PATH || 'default';
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        hasDatabaseUrl,
        hasPrisma,
        dbConnection,
        dbError,
        nodeEnv: process.env.NODE_ENV,
        schemaPath,
      },
      // Include connection string info (masked for security)
      databaseInfo: {
        urlPresent: hasDatabaseUrl,
        urlFormat: hasDatabaseUrl 
          ? (process.env.DATABASE_URL?.startsWith('postgresql://') ? 'postgresql' : 'other')
          : 'none',
        urlLength: process.env.DATABASE_URL?.length || 0,
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }, { status: 500 });
  }
}

