'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { RiskMatrix } from '@/components/risk-assessment/RiskMatrix';
import { RiskForm } from '@/components/risk-assessment/RiskForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Plus, 
  Filter, 
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Risk, RISK_CATEGORIES_DUTCH, RISK_LEVELS_DUTCH } from '@/lib/types';
import { getRiskLevelColor } from '@/lib/utils';

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchRisks();
  }, []);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // Create fresh Date objects each time to avoid serialization issues
      const mockRisks: Risk[] = [
        {
          id: '1',
          assessmentId: 'assessment-1',
          companyId: 'company-1',
          category: 'PHYSICAL_WORKSPACE',
          title: 'Oncomfortabele werkplek',
          description: 'Werkplekken met onvoldoende ergonomische aanpassingen',
          location: 'Kantoor verdieping 2',
          department: 'Administratie',
          probability: 4,
          impact: 4,
          riskLevel: 'HIGH',
          exposedEmployees: 8,
          currentMeasures: ['Basis ergonomische stoelen'],
          proposedMeasures: ['Aanpassen werkplekken', 'Ergonomische training'],
          status: 'active',
          createdDate: new Date('2024-01-15'),
          reviewDate: new Date('2024-07-15'),
          attachments: [],
        },
        {
          id: '2',
          assessmentId: 'assessment-1',
          companyId: 'company-1',
          category: 'SAFETY_RISKS',
          title: 'Brandveiligheid',
          description: 'Onvoldoende brandveiligheidsmaatregelen',
          location: 'Hele gebouw',
          department: 'Algemeen',
          probability: 2,
          impact: 5,
          riskLevel: 'HIGH',
          exposedEmployees: 25,
          currentMeasures: ['Brandblussers aanwezig'],
          proposedMeasures: ['Brandveiligheidstraining', 'Nooduitgangen controleren'],
          status: 'active',
          createdDate: new Date('2024-01-10'),
          reviewDate: new Date('2024-07-10'),
          attachments: [],
        },
        {
          id: '3',
          assessmentId: 'assessment-1',
          companyId: 'company-1',
          category: 'PSYCHOSOCIAL',
          title: 'Werkdruk',
          description: 'Hoge werkdruk bij bepaalde afdelingen',
          location: 'Productie afdeling',
          department: 'Productie',
          probability: 3,
          impact: 3,
          riskLevel: 'MEDIUM',
          exposedEmployees: 12,
          currentMeasures: ['Flexibele werktijden'],
          proposedMeasures: ['Werkdruk analyse', 'Extra personeel'],
          status: 'active',
          createdDate: new Date('2024-01-20'),
          reviewDate: new Date('2024-07-20'),
          attachments: [],
        },
      ];
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setRisks(mockRisks);
    } catch (error) {
      console.error('Error fetching risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRisk = () => {
    setEditingRisk(null);
    setShowForm(true);
  };

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk(risk);
    setShowForm(true);
  };

  const handleDeleteRisk = async (riskId: string) => {
    if (confirm('Weet je zeker dat je dit risico wilt verwijderen?')) {
      setRisks(risks.filter(risk => risk.id !== riskId));
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingRisk) {
        // Update existing risk
        setRisks(risks.map(risk => 
          risk.id === editingRisk.id 
            ? { ...risk, ...data, updatedAt: new Date() }
            : risk
        ));
      } else {
        // Add new risk
        const newRisk: Risk = {
          id: Date.now().toString(),
          assessmentId: 'assessment-1',
          companyId: 'company-1',
          ...data,
          riskLevel: data.riskLevel || 'LOW',
          status: 'active',
          createdDate: new Date(),
          reviewDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
          attachments: [],
        };
        setRisks([newRisk, ...risks]);
      }
      setShowForm(false);
      setEditingRisk(null);
    } catch (error) {
      console.error('Error saving risk:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRisk(null);
  };

  const filteredRisks = risks.filter(risk => {
    if (filter === 'all') return true;
    if (filter === 'critical') return risk.riskLevel === 'CRITICAL';
    if (filter === 'high') return risk.riskLevel === 'HIGH';
    if (filter === 'medium') return risk.riskLevel === 'MEDIUM';
    if (filter === 'low') return risk.riskLevel === 'LOW';
    return true;
  }).filter(risk => {
    if (categoryFilter === 'all') return true;
    return risk.category === categoryFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64">
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Risico's worden geladen...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <RiskForm
                risk={editingRisk}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Risico Inventarisatie</h1>
              <p className="mt-2 text-gray-600">
                Beheer en beoordeel werkplekrisico's
              </p>
            </div>

            {/* Filters and Actions */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle risico's</option>
                  <option value="critical">Kritiek</option>
                  <option value="high">Hoog</option>
                  <option value="medium">Gemiddeld</option>
                  <option value="low">Laag</option>
                </select>
                
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle categorieën</option>
                  {Object.entries(RISK_CATEGORIES_DUTCH).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handleAddRisk}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuw Risico
                </Button>
              </div>
            </div>

            {/* Risk Matrix */}
            <div className="mb-8">
              <RiskMatrix
                risks={filteredRisks}
                onAddRisk={handleAddRisk}
                onEditRisk={handleEditRisk}
                onDeleteRisk={handleDeleteRisk}
              />
            </div>

            {/* Risk List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Risico Overzicht ({filteredRisks.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRisks.map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{risk.title}</h3>
                          <Badge className={getRiskLevelColor(risk.riskLevel)}>
                            {RISK_LEVELS_DUTCH[risk.riskLevel]}
                          </Badge>
                          <Badge variant="outline">
                            {RISK_CATEGORIES_DUTCH[risk.category]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Locatie: {risk.location}</span>
                          <span>Score: {risk.probability}×{risk.impact} = {risk.probability * risk.impact}</span>
                          <span>Medewerkers: {risk.exposedEmployees}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditRisk(risk)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteRisk(risk.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredRisks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Geen risico's gevonden</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddRisk}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Eerste risico toevoegen
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
