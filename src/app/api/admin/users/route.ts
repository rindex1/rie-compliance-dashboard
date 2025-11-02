import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isProvisionAuthorized } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database niet geconfigureerd' },
        { status: 503 }
      );
    }

    if (!isProvisionAuthorized(request)) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: { select: { id: true, name: true } },
        license: { select: { plan: true, status: true, accountLimit: true, expiresAt: true } },
        assignedById: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    );
  }
}


