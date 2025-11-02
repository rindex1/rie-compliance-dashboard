import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { calculateComplianceScore } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Check if database is available
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database not configured. Using mock data in frontend.' },
        { status: 503 }
      );
    }

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get company data
    const company = await prisma.company.findUnique({
      where: { id: user.companyId },
      include: {
        assessments: {
          where: { status: 'COMPLETED' },
          include: {
            risks: true,
            actions: true,
          },
        },
        risks: {
          include: {
            countermeasures: true,
            actions: true,
          },
        },
        actions: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Calculate compliance overview
    const totalRisks = company.risks.length;
    const criticalRisks = company.risks.filter((risk: any) => risk.riskLevel === 'CRITICAL').length;
    const highRisks = company.risks.filter((risk: any) => risk.riskLevel === 'HIGH').length;
    const completedActions = company.actions.filter((action: any) => action.status === 'COMPLETED').length;
    const totalActions = company.actions.length;

    const overallScore = calculateComplianceScore(
      totalRisks,
      criticalRisks,
      highRisks,
      completedActions,
      totalActions
    );

    // Get critical areas
    const criticalAreas = [
      {
        category: 'Fysieke werkplek',
        status: highRisks > 0 ? 'orange' : 'green',
        count: company.risks.filter((r: any) => r.category === 'PHYSICAL_WORKSPACE').length,
      },
      {
        category: 'Veiligheidsrisico\'s',
        status: criticalRisks > 0 ? 'red' : 'green',
        count: company.risks.filter((r: any) => r.category === 'SAFETY_RISKS').length,
      },
      {
        category: 'Psychosociale factoren',
        status: 'green',
        count: company.risks.filter((r: any) => r.category === 'PSYCHOSOCIAL').length,
      },
    ];

    // Get risk categories stats
    const riskCategories = [
      {
        category: 'PHYSICAL_WORKSPACE',
        totalRisks: company.risks.filter(r => r.category === 'PHYSICAL_WORKSPACE').length,
        highRiskCount: company.risks.filter(r => r.category === 'PHYSICAL_WORKSPACE' && r.riskLevel === 'HIGH').length,
        criticalRiskCount: company.risks.filter(r => r.category === 'PHYSICAL_WORKSPACE' && r.riskLevel === 'CRITICAL').length,
        averageScore: company.risks.filter(r => r.category === 'PHYSICAL_WORKSPACE').reduce((sum, r) => sum + (r.probability * r.impact), 0) / Math.max(1, company.risks.filter(r => r.category === 'PHYSICAL_WORKSPACE').length),
      },
      {
        category: 'SAFETY_RISKS',
        totalRisks: company.risks.filter(r => r.category === 'SAFETY_RISKS').length,
        highRiskCount: company.risks.filter(r => r.category === 'SAFETY_RISKS' && r.riskLevel === 'HIGH').length,
        criticalRiskCount: company.risks.filter(r => r.category === 'SAFETY_RISKS' && r.riskLevel === 'CRITICAL').length,
        averageScore: company.risks.filter(r => r.category === 'SAFETY_RISKS').reduce((sum, r) => sum + (r.probability * r.impact), 0) / Math.max(1, company.risks.filter(r => r.category === 'SAFETY_RISKS').length),
      },
      {
        category: 'PSYCHOSOCIAL',
        totalRisks: company.risks.filter(r => r.category === 'PSYCHOSOCIAL').length,
        highRiskCount: company.risks.filter(r => r.category === 'PSYCHOSOCIAL' && r.riskLevel === 'HIGH').length,
        criticalRiskCount: company.risks.filter(r => r.category === 'PSYCHOSOCIAL' && r.riskLevel === 'CRITICAL').length,
        averageScore: company.risks.filter(r => r.category === 'PSYCHOSOCIAL').reduce((sum, r) => sum + (r.probability * r.impact), 0) / Math.max(1, company.risks.filter(r => r.category === 'PSYCHOSOCIAL').length),
      },
      {
        category: 'ENVIRONMENTAL',
        totalRisks: company.risks.filter(r => r.category === 'ENVIRONMENTAL').length,
        highRiskCount: company.risks.filter(r => r.category === 'ENVIRONMENTAL' && r.riskLevel === 'HIGH').length,
        criticalRiskCount: company.risks.filter(r => r.category === 'ENVIRONMENTAL' && r.riskLevel === 'CRITICAL').length,
        averageScore: company.risks.filter(r => r.category === 'ENVIRONMENTAL').reduce((sum, r) => sum + (r.probability * r.impact), 0) / Math.max(1, company.risks.filter(r => r.category === 'ENVIRONMENTAL').length),
      },
    ];

    // Get recent actions
    const recentActions = company.actions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    // Get upcoming deadlines
    const upcomingDeadlines = company.actions
      .filter(action => action.dueDate && new Date(action.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);

    // Calculate days until next review
    const nextReview = company.assessments
      .filter(a => a.reviewDate && new Date(a.reviewDate) > new Date())
      .sort((a, b) => new Date(a.reviewDate!).getTime() - new Date(b.reviewDate!).getTime())[0];

    const daysUntilReview = nextReview 
      ? Math.ceil((new Date(nextReview.reviewDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Get urgent actions
    const urgentActions = company.actions.filter(action => 
      action.priority === 'URGENT' && action.status !== 'COMPLETED'
    ).length;

    const dashboardData = {
      complianceOverview: {
        overallScore,
        criticalAreas,
        openRisks: totalRisks,
        resolvedRisks: completedActions,
        daysUntilReview,
        urgentActions,
      },
      riskCategories,
      recentActions,
      upcomingDeadlines,
      complianceTrend: [
        { date: '2024-01-01', score: overallScore - 5 },
        { date: '2024-01-15', score: overallScore - 2 },
        { date: '2024-02-01', score: overallScore },
      ],
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
