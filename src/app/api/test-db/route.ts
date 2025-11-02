import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Test database connection and schema
export async function GET(request: NextRequest) {
  try {
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'Database not configured',
        details: {
          hasPrisma: !!prisma,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        }
      }, { status: 503 });
    }

    // Test 1: Simple query
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Test 2: Check if users table exists and has onboardingCompleted column
    let usersTableCheck = null;
    try {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          onboardingCompleted: true,
        },
        take: 1,
      });
      usersTableCheck = {
        exists: true,
        hasOnboardingColumn: 'onboardingCompleted' in (user || {}),
        sampleUser: user ? { email: user.email, onboardingCompleted: user.onboardingCompleted } : null,
      };
    } catch (error: any) {
      usersTableCheck = {
        exists: false,
        error: error.message,
      };
    }

    // Test 3: Check risk_templates table
    let templatesCheck = null;
    try {
      const count = await prisma.riskTemplate.count();
      templatesCheck = {
        exists: true,
        count,
      };
    } catch (error: any) {
      templatesCheck = {
        exists: false,
        error: error.message,
      };
    }

    return NextResponse.json({
      status: 'success',
      tests: {
        basicQuery: { success: true, result: testQuery },
        usersTable: usersTableCheck,
        riskTemplatesTable: templatesCheck,
      },
      databaseUrl: {
        present: !!process.env.DATABASE_URL,
        startsWithPostgres: process.env.DATABASE_URL?.startsWith('postgresql://'),
        length: process.env.DATABASE_URL?.length || 0,
      }
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database test failed',
      message: error.message || String(error),
      code: error.code,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name,
      } : undefined,
    }, { status: 500 });
  }
}

