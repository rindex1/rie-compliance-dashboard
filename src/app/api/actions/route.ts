import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, requireAuth } from '@/lib/auth';

// GET /api/actions - Get all actions for the company
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const overdue = searchParams.get('overdue') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      companyId: user.companyId,
    };

    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (assignedTo) {
      where.assignedToId = assignedTo;
    }
    if (overdue) {
      where.dueDate = {
        lt: new Date(),
      };
      where.status = {
        not: 'COMPLETED',
      };
    }

    const actions = await prisma.action.findMany({
      where,
      include: {
        assignedTo: {
          select: { name: true, email: true }
        },
        risk: {
          select: { title: true, category: true }
        },
        assessment: {
          select: { title: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.action.count({ where });

    return NextResponse.json({
      actions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching actions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/actions - Create a new action
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const {
      assessmentId,
      riskId,
      title,
      description,
      priority,
      assignedToId,
      dueDate,
      cost,
    } = body;

    // Validate required fields
    if (!title || !description || !priority) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const action = await prisma.action.create({
      data: {
        assessmentId,
        riskId,
        companyId: user.companyId!,
        title,
        description,
        priority,
        assignedToId,
        dueDate: dueDate ? new Date(dueDate) : null,
        cost,
      },
      include: {
        assignedTo: {
          select: { name: true, email: true }
        },
        risk: {
          select: { title: true, category: true }
        },
        assessment: {
          select: { title: true }
        }
      },
    });

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    console.error('Error creating action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
