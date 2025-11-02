import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest, requireAuth } from '@/lib/auth';
import { DocumentGenerator } from '@/lib/document-generator';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { assessmentId, format = 'docx' } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    // Get assessment data
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        companyId: user.companyId,
      },
      include: {
        company: true,
        risks: {
          include: {
            countermeasures: true,
            actions: true,
          },
        },
        actions: true,
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get assessor info
    const assessor = await prisma.user.findUnique({
      where: { id: assessment.assessorId },
      select: { name: true, email: true },
    });

    const reportData = {
      company: assessment.company,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        description: assessment.description,
        status: assessment.status,
        version: assessment.version,
        startDate: assessment.startDate,
        endDate: assessment.endDate,
        reviewDate: assessment.reviewDate,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      },
      risks: assessment.risks,
      actions: assessment.actions,
      generatedAt: new Date(),
      assessor: assessor?.name || 'Onbekend',
    };

    let blob: Blob;
    let filename: string;
    let mimeType: string;

    if (format === 'pdf') {
      blob = await DocumentGenerator.generatePDFReport(reportData);
      filename = `RI&E_${assessment.company.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      mimeType = 'application/pdf';
    } else {
      blob = await DocumentGenerator.generateRIEReport(reportData);
      filename = `RI&E_${assessment.company.name}_${new Date().toISOString().split('T')[0]}.docx`;
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // Convert blob to buffer
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating RI&E report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
