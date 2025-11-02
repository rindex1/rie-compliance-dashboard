import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/risk-templates - Get all active risk templates, optionally filtered by category
export async function GET(request: NextRequest) {
  try {
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database niet geconfigureerd' },
        { status: 503 }
      );
    }

    // Optional: require authentication
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    // Get optional category filter from query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = { active: true };
    if (category) {
      where.category = category;
    }

    const templates = await prisma.riskTemplate.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { title: 'asc' },
      ],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching risk templates:', error);
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    );
  }
}

