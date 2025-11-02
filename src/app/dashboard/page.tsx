'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/layout/Sidebar';
import { ComplianceOverview } from '@/components/dashboard/ComplianceOverview';
import { RiskCategories } from '@/components/dashboard/RiskCategories';
import { ActionManagement } from '@/components/dashboard/ActionManagement';
import { DashboardData, ComplianceOverview as ComplianceOverviewType, RiskCategoryStats, Action } from '@/lib/types';

// Mock data for development - using date strings instead of Date objects
const getMockDashboardData = (): DashboardData => ({
  complianceOverview: {
    overallScore: 78,
    criticalAreas: [
      { category: 'Fysieke werkplek', status: 'orange', count: 3 },
      { category: 'Veiligheidsrisico\'s', status: 'red', count: 2 },
      { category: 'Psychosociale factoren', status: 'green', count: 1 },
    ],
    openRisks: 12,
    resolvedRisks: 8,
    daysUntilReview: 45,
    urgentActions: 3,
  },
  riskCategories: [
    {
      category: 'PHYSICAL_WORKSPACE',
      totalRisks: 5,
      highRiskCount: 2,
      criticalRiskCount: 1,
      averageScore: 12.5,
    },
    {
      category: 'SAFETY_RISKS',
      totalRisks: 3,
      highRiskCount: 1,
      criticalRiskCount: 1,
      averageScore: 18.3,
    },
    {
      category: 'PSYCHOSOCIAL',
      totalRisks: 2,
      highRiskCount: 0,
      criticalRiskCount: 0,
      averageScore: 8.0,
    },
    {
      category: 'ENVIRONMENTAL',
      totalRisks: 4,
      highRiskCount: 1,
      criticalRiskCount: 0,
      averageScore: 10.2,
    },
  ],
  recentActions: [
    {
      id: '1',
      companyId: 'company-1',
      title: 'Ergonomische werkplek aanpassingen',
      description: 'Aanpassen van werkplekken volgens ergonomische richtlijnen',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedToId: 'user-1',
      dueDate: new Date('2024-02-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    },
    {
      id: '2',
      companyId: 'company-1',
      title: 'Brandveiligheidstraining',
      description: 'Alle medewerkers trainen in brandveiligheid',
      priority: 'URGENT',
      status: 'PENDING',
      dueDate: new Date('2024-01-30'),
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
  ],
  upcomingDeadlines: [
    {
      id: '3',
      companyId: 'company-1',
      title: 'RI&E herbeoordeling',
      description: 'Verplichte herbeoordeling van de RI&E',
      priority: 'HIGH',
      status: 'PENDING',
      dueDate: new Date('2024-03-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ],
  complianceTrend: [
    { date: '2024-01-01', score: 75 },
    { date: '2024-01-15', score: 78 },
    { date: '2024-02-01', score: 78 },
  ],
});

export default function DashboardPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user needs to complete onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!token || !user) return;

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // If user hasn't completed onboarding, redirect to RI&E wizard
          if (!data.user.onboardingCompleted) {
            router.push('/rie/new');
            return;
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
      }
    };

    checkOnboarding();
  }, [token, user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setError('Niet geautoriseerd. Log opnieuw in.');
          } else if (response.status === 503) {
            // Database not configured, use mock data
            setDashboardData(getMockDashboardData());
          } else {
            throw new Error('Fout bij het laden van dashboard gegevens');
          }
        } else {
          const data = await response.json();
          // Transform date strings to Date objects
          const transformedData: DashboardData = {
            ...data,
            recentActions: data.recentActions?.map((action: any) => ({
              ...action,
              dueDate: action.dueDate ? new Date(action.dueDate) : undefined,
              createdAt: new Date(action.createdAt),
              updatedAt: new Date(action.updatedAt),
              completedDate: action.completedDate ? new Date(action.completedDate) : undefined,
            })) || [],
            upcomingDeadlines: data.upcomingDeadlines?.map((action: any) => ({
              ...action,
              dueDate: action.dueDate ? new Date(action.dueDate) : undefined,
              createdAt: new Date(action.createdAt),
              updatedAt: new Date(action.updatedAt),
              completedDate: action.completedDate ? new Date(action.completedDate) : undefined,
            })) || [],
          };
          setDashboardData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Onbekende fout');
        // Fallback to mock data on error
        setDashboardData(getMockDashboardData());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Dashboard wordt geladen...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData && !error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <div className="lg:pl-64">
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <p className="text-red-600">Fout bij het laden van dashboard gegevens</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64">
          {error && (
            <div className="mx-4 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Overzicht van uw RI&E compliance status en acties
              </p>
            </div>

            {/* Dashboard Content */}
            {dashboardData && (
              <div className="space-y-8">
                {/* Compliance Overview */}
                <ComplianceOverview data={dashboardData.complianceOverview} />

                {/* Risk Categories */}
                <RiskCategories data={dashboardData.riskCategories} />

                {/* Action Management */}
                <ActionManagement 
                  actions={[...dashboardData.recentActions, ...dashboardData.upcomingDeadlines]}
                  onAddAction={() => console.log('Add action clicked')}
                  onFilterChange={(filter) => console.log('Filter changed:', filter)}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
