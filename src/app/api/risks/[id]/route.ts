import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, requireAuth } from '@/lib/auth';
import { calculateRiskLevel } from '@/lib/utils';

// GET /api/risks/[id] - Get a specific risk
export const GET = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const risk = await prisma.risk.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
      include: {
        countermeasures: true,
        actions: true,
        comments: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        assessment: {
          select: {
            title: true,
            status: true,
          }
        }
      },
    });

    if (!risk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    return NextResponse.json(risk);
  } catch (error) {
    console.error('Error fetching risk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// PUT /api/risks/[id] - Update a risk
export const PUT = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    const body = await request.json();
    const {
      category,
      title,
      description,
      location,
      department,
      probability,
      impact,
      exposedEmployees,
      currentMeasures,
      proposedMeasures,
      attachments,
      status,
    } = body;

    // Check if risk exists and belongs to user's company
    const existingRisk = await prisma.risk.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
    });

    if (!existingRisk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    // Calculate new risk level if probability or impact changed
    let riskLevel = existingRisk.riskLevel;
    if (probability !== undefined && impact !== undefined) {
      riskLevel = calculateRiskLevel(probability, impact);
    }

    const updatedRisk = await prisma.risk.update({
      where: { id: params.id },
      data: {
        ...(category && { category }),
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(department !== undefined && { department }),
        ...(probability !== undefined && { probability }),
        ...(impact !== undefined && { impact }),
        ...(riskLevel && { riskLevel }),
        ...(exposedEmployees !== undefined && { exposedEmployees }),
        ...(currentMeasures && { currentMeasures }),
        ...(proposedMeasures && { proposedMeasures }),
        ...(attachments && { attachments }),
        ...(status && { status }),
      },
      include: {
        countermeasures: true,
        actions: true,
        comments: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    return NextResponse.json(updatedRisk);
  } catch (error) {
    console.error('Error updating risk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/risks/[id] - Delete a risk
export const DELETE = requireAuth(async (request: NextRequest, user, { params }: { params: { id: string } }) => {
  try {
    // Check if risk exists and belongs to user's company
    const existingRisk = await prisma.risk.findFirst({
      where: {
        id: params.id,
        companyId: user.companyId,
      },
    });

    if (!existingRisk) {
      return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
    }

    // Delete related data first
    await prisma.countermeasure.deleteMany({
      where: { riskId: params.id },
    });

    await prisma.action.deleteMany({
      where: { riskId: params.id },
    });

    await prisma.riskComment.deleteMany({
      where: { riskId: params.id },
    });

    // Delete the risk
    await prisma.risk.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    console.error('Error deleting risk:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
