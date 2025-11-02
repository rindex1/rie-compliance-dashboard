import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { RieData } from '@/lib/types';

// POST /api/assessments - Create a new RI&E assessment with full template data
export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { title, startDate, rieData }: { title: string; startDate?: string; rieData: RieData } = body;

    if (!title || !rieData) {
      return NextResponse.json({ error: 'Missing required fields: title, rieData' }, { status: 400 });
    }

    // Basic validation for core RI&E data presence
    if (!rieData.company?.companyName || !rieData.goalAndScope || !Array.isArray(rieData.workAreas)) {
      return NextResponse.json({ error: 'Invalid RI&E data structure' }, { status: 400 });
    }

    // Ensure company exists or create it
    let companyId = user.companyId;
    if (!companyId && rieData.company.companyName) {
      const company = await prisma.company.upsert({
        where: { name: rieData.company.companyName },
        update: {},
        create: {
          name: rieData.company.companyName,
          address: rieData.company.address || undefined,
          country: 'Netherlands',
        },
      });
      companyId = company.id;
      
      // Update user's companyId
      await prisma.user.update({
        where: { id: user.id },
        data: { companyId },
      });
    }

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Create assessment and risks in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const assessment = await tx.assessment.create({
        data: {
          companyId,
          assessorId: user.id,
          title,
          description: rieData.goalAndScope?.goals?.join(', ')?.slice(0, 500) || null,
          rieData: rieData as unknown as any,
          status: 'COMPLETED', // Mark as completed after wizard
          version: 1,
          startDate: startDate ? new Date(startDate) : new Date(),
        },
      });

      // Create Risk records from workAreas
      const risks = [];
      for (const workArea of rieData.workAreas || []) {
        for (const riskData of workArea.risks || []) {
          // Map risk category from wizard to RiskCategory enum
          const categoryMap: Record<string, string> = {
            'PHYSICAL': 'PHYSICAL_WORKSPACE',
            'CHEMICAL': 'CHEMICAL',
            'BIOLOGICAL': 'BIOLOGICAL',
            'ERGONOMIC': 'ERGONOMIC',
            'PSYCHOSOCIAL': 'PSYCHOSOCIAL',
            'ORGANIZATIONAL': 'ORGANIZATIONAL',
          };

          const mappedCategory = categoryMap[riskData.category] || 'PHYSICAL_WORKSPACE';
          
          // Calculate riskLevel from score
          const score = riskData.score || (riskData.probability || 1) * (riskData.severity || 1);
          let riskLevel = 'LOW';
          if (score >= 16) riskLevel = 'CRITICAL';
          else if (score >= 10) riskLevel = 'HIGH';
          else if (score >= 5) riskLevel = 'MEDIUM';

          const risk = await tx.risk.create({
            data: {
              assessmentId: assessment.id,
              companyId,
              category: mappedCategory as any,
              title: riskData.title || riskData.description || 'Onbekend risico',
              description: riskData.description || '',
              location: riskData.location || workArea.name || '',
              probability: riskData.probability || 1,
              impact: riskData.severity || 1,
              riskLevel: riskLevel as any,
              currentMeasures: riskData.currentMeasures || null,
              proposedMeasures: null,
              status: 'active',
            },
          });
          risks.push(risk);
        }
      }

      return { assessment, risks };
    });

    return NextResponse.json(result.assessment, { status: 201 });
  } catch (error: any) {
    console.error('Error creating RI&E assessment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});


