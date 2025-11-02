'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { RieData } from '@/lib/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Search,
  Calculator,
  Target,
  Wrench,
  ClipboardList,
  PlayCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Save,
} from 'lucide-react';

// Risk categories based on the template
const RISK_CATEGORIES = {
  PHYSICAL: 'Fysieke risico\'s (lawaai, trillingen, klimaat)',
  CHEMICAL: 'Chemische risico\'s (stoffen, dampen)',
  BIOLOGICAL: 'Biologische risico\'s (micro-organismen)',
  ERGONOMIC: 'Ergonomische risico\'s (tillen, beeldschermwerk)',
  PSYCHOSOCIAL: 'Psychosociale risico\'s (werkdruk, ongewenst gedrag)',
  ORGANIZATIONAL: 'Organisatorische risico\'s (werktijden, procedures)',
};

// Ernst levels (E)
const ERNST_LEVELS = [
  { value: 1, label: 'E1 - Verwaarloosbaar', description: 'EHBO' },
  { value: 2, label: 'E2 - Gering', description: 'Arts, < 1 week verzuim' },
  { value: 3, label: 'E3 - Matig', description: '> 1 week verzuim' },
  { value: 4, label: 'E4 - Ernstig', description: 'Blijvend letsel' },
  { value: 5, label: 'E5 - Zeer ernstig', description: 'Dodelijk' },
];

// Waarschijnlijkheid levels (W)
const WAARSCHIJNLIJKHEID_LEVELS = [
  { value: 1, label: 'W1 - Zeer onwaarschijnlijk', description: '1x per 100 jaar' },
  { value: 2, label: 'W2 - Onwaarschijnlijk', description: '1x per 10 jaar' },
  { value: 3, label: 'W3 - Mogelijk', description: '1x per jaar' },
  { value: 4, label: 'W4 - Waarschijnlijk', description: '1x per maand' },
  { value: 5, label: 'W5 - Zeer waarschijnlijk', description: '1x per week of vaker' },
];

// Measure types
const MEASURE_TYPES = [
  { value: 'ELIMINATE', label: 'Bron aanpakken (Eliminatie)', priority: 1 },
  { value: 'COLLECTIVE', label: 'Collectieve bescherming', priority: 2 },
  { value: 'ORGANIZATIONAL', label: 'Organisatorische maatregelen', priority: 3 },
  { value: 'PPE', label: 'Persoonlijke beschermingsmiddelen (PBM)', priority: 4 },
];

interface Risk {
  id: string;
  category: string;
  description: string;
  location: string;
  affectedPersons: string;
  currentMeasures: string;
  ernst: number;
  waarschijnlijkheid: number;
  riskScore: number;
  riskClass: 'LAAG' | 'MATIG' | 'HOOG' | 'ZEER_HOOG';
  proposedMeasures: Array<{
    type: string;
    description: string;
    responsible: string;
    deadline: string;
    cost: string;
  }>;
}

const RIE_STEPS = [
  { id: 1, title: 'Bedrijfsgegevens', icon: Shield, description: 'Context & scope' },
  { id: 2, title: 'Inventarisatie', icon: Search, description: 'Gevaren identificeren' },
  { id: 3, title: 'Beoordeling', icon: Calculator, description: 'Risicoscore berekenen' },
  { id: 4, title: 'Risicoklasse', icon: Target, description: 'Klasse bepalen' },
  { id: 5, title: 'Maatregelen', icon: Wrench, description: 'Plan van aanpak' },
  { id: 6, title: 'Betrokkenheid', icon: ClipboardList, description: 'OR/PVT & medewerkers' },
  { id: 7, title: 'Documenten', icon: FileText, description: 'Checklist & bijlagen' },
  { id: 8, title: 'Afronden', icon: PlayCircle, description: 'Review & opslaan' },
];

function calculateRiskClass(score: number): 'LAAG' | 'MATIG' | 'HOOG' | 'ZEER_HOOG' {
  if (score >= 16) return 'ZEER_HOOG';
  if (score >= 10) return 'HOOG';
  if (score >= 5) return 'MATIG';
  return 'LAAG';
}

function getRiskClassColor(riskClass: string): string {
  switch (riskClass) {
    case 'ZEER_HOOG':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'HOOG':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'MATIG':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'LAAG':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

function getRiskClassAction(riskClass: string): string {
  switch (riskClass) {
    case 'ZEER_HOOG':
      return '🔴 Onmiddellijke actie vereist - Stop werkzaamheden tot oplossing';
    case 'HOOG':
      return '🟠 Actie nodig binnen 3 maanden';
    case 'MATIG':
      return '🟡 Actie gewenst binnen 1 jaar';
    case 'LAAG':
      return '🟢 Geen directe actie nodig - Normale aandacht';
    default:
      return '';
  }
}

export default function NewRIEPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [title, setTitle] = useState<string>('RI&E Volledig');

  // Check if user has already completed onboarding (for optional access)
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!token || !user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Allow access if onboarding not completed, or if user wants to create another RI&E
          setCheckingOnboarding(false);
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err);
        setCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [token, user]);

  // Load risk templates
  useEffect(() => {
    const loadTemplates = async () => {
      if (!token) return;
      try {
        const response = await fetch('/api/risk-templates', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setRiskTemplates(data.templates || []);
        }
      } catch (err) {
        console.error('Error loading risk templates:', err);
      }
    };

    if (token) {
      loadTemplates();
    }
  }, [token]);

  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    address: '',
    chamberOfCommerceNumber: '',
    employeeCount: 0,
    industry: '',
    assessmentDate: new Date().toISOString().slice(0, 10),
    executedBy: '',
    preventionExpert: '',
    validUntil: '',
    version: '1.0',
  });
  const [scope, setScope] = useState({
    workAreasCovered: '',
    employeeGroups: [],
    riskDomains: [],
    specialGroups: [],
  } as any);
  const [managementSystem, setManagementSystem] = useState({ vca2Stars: false, iso45001: false, notes: '' });
  const [involvement, setInvolvement] = useState({
    orMeetingDate: '',
    attendees: [],
    orAdvice: 'Geen',
    orComments: '',
    participants: [],
    method: [],
  } as any);
  const [documentChecklist, setDocumentChecklist] = useState({
    general: {},
    bhv: {},
    hazardousSubstances: {},
    machinesTools: {},
    specificGroups: {},
    registrations: {},
  } as any);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [riskTemplates, setRiskTemplates] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<Partial<Risk>>({
    category: '',
    description: '',
    location: '',
    affectedPersons: '',
    currentMeasures: '',
    ernst: 0,
    waarschijnlijkheid: 0,
    proposedMeasures: [],
  });

  const calculateRiskScore = (ernst: number, waarschijnlijkheid: number) => {
    return ernst * waarschijnlijkheid;
  };

  const applyTemplate = (template: any) => {
    // Map template category to wizard category
    const categoryMap: Record<string, string> = {
      'PHYSICAL_WORKSPACE': 'PHYSICAL',
      'CHEMICAL_BIOLOGICAL': 'CHEMICAL',
      'PHYSICAL_STRAIN': 'ERGONOMIC',
      'PSYCHOSOCIAL': 'PSYCHOSOCIAL',
      'SAFETY_RISKS': 'PHYSICAL',
      'ENVIRONMENTAL': 'ORGANIZATIONAL',
    };

    setCurrentRisk({
      ...currentRisk,
      category: categoryMap[template.category] || template.category,
      description: template.title,
      currentMeasures: template.controls || '',
    });
    setShowTemplates(false);
  };

  const addRisk = () => {
    if (!currentRisk.category || !currentRisk.description) {
      alert('Vul minimaal de categorie en beschrijving in');
      return;
    }

    const riskScore = calculateRiskScore(currentRisk.ernst || 0, currentRisk.waarschijnlijkheid || 0);
    const riskClass = calculateRiskClass(riskScore);

    const newRisk: Risk = {
      id: Date.now().toString(),
      category: currentRisk.category || '',
      description: currentRisk.description || '',
      location: currentRisk.location || '',
      affectedPersons: currentRisk.affectedPersons || '',
      currentMeasures: currentRisk.currentMeasures || '',
      ernst: currentRisk.ernst || 0,
      waarschijnlijkheid: currentRisk.waarschijnlijkheid || 0,
      riskScore,
      riskClass,
      proposedMeasures: currentRisk.proposedMeasures || [],
    };

    setRisks([...risks, newRisk]);
    setCurrentRisk({
      category: '',
      description: '',
      location: '',
      affectedPersons: '',
      currentMeasures: '',
      ernst: 0,
      waarschijnlijkheid: 0,
      proposedMeasures: [],
    });
  };

  const deleteRisk = (id: string) => {
    setRisks(risks.filter(r => r.id !== id));
  };

  const nextStep = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  const handleSubmitAll = async () => {
    const rieData: RieData = {
      company: {
        companyName: companyInfo.companyName,
        address: companyInfo.address,
        chamberOfCommerceNumber: companyInfo.chamberOfCommerceNumber || undefined,
        employeeCount: Number(companyInfo.employeeCount || 0),
        industry: companyInfo.industry,
        assessmentDate: companyInfo.assessmentDate,
        executedBy: companyInfo.executedBy,
        preventionExpert: companyInfo.preventionExpert || undefined,
        validUntil: companyInfo.validUntil || undefined,
        version: companyInfo.version || '1.0',
      },
      goalAndScope: {
        goals: [
          'Alle arbeidsrisico\'s in kaart brengen',
          'Ernst beoordelen volgens Arbowet-methodiek',
          'Beheersmaatregelen vaststellen',
          'Plan van Aanpak opstellen',
        ],
        scope: scope as any,
      },
      managementSystem,
      riskMethod: { probabilityScale: 5, severityScale: 5 },
      workAreas: [
        {
          name: 'Algemeen',
          risks: risks.map(r => ({
            riskId: r.id,
            workArea: 'Algemeen',
            category: r.category,
            title: r.description,
            description: r.description,
            location: r.location,
            currentMeasures: r.currentMeasures ? [r.currentMeasures] : [],
            probability: (r.waarschijnlijkheid as any) || 1,
            severity: (r.ernst as any) || 1,
            score: r.riskScore,
          })),
        },
      ],
      planOfApproach: [],
      involvement: involvement as any,
      documentChecklist: documentChecklist as any,
    };

    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ title, rieData }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || 'Opslaan mislukt');
        return;
      }
      
      // Mark onboarding as completed and redirect to dashboard
      try {
        await fetch('/api/auth/complete-onboarding', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
      } catch (e) {
        console.error('Error marking onboarding complete:', e);
      }
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (e) {
      alert('Netwerkfout bij opslaan');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Nieuwe RI&E Opstellen</h1>
              <p className="mt-2 text-gray-600">
                Volg het 8-stappenplan volgens de Nederlandse Arbowet
              </p>
            </div>

            {/* Progress Steps */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
                  <div className="relative flex justify-between">
                    {RIE_STEPS.map((step) => (
                      <div key={step.id} className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                            currentStep > step.id
                              ? 'bg-green-500 border-green-500 text-white'
                              : currentStep === step.id
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          {currentStep > step.id ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="mt-2 text-center max-w-24">
                          <p className="text-xs font-medium text-gray-900">{step.title}</p>
                          <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Bedrijfsgegevens & Scope */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <span>STAP 1: Bedrijfsgegevens & Scope</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titel RI&E *</label>
                      <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrijfsnaam *</label>
                      <input value={companyInfo.companyName} onChange={(e)=>setCompanyInfo({...companyInfo, companyName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <input value={companyInfo.address} onChange={(e)=>setCompanyInfo({...companyInfo, address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">KvK-nummer</label>
                      <input value={companyInfo.chamberOfCommerceNumber} onChange={(e)=>setCompanyInfo({...companyInfo, chamberOfCommerceNumber: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aantal medewerkers</label>
                      <input type="number" value={companyInfo.employeeCount} onChange={(e)=>setCompanyInfo({...companyInfo, employeeCount: Number(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branche</label>
                      <input value={companyInfo.industry} onChange={(e)=>setCompanyInfo({...companyInfo, industry: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum RI&E</label>
                      <input type="date" value={companyInfo.assessmentDate} onChange={(e)=>setCompanyInfo({...companyInfo, assessmentDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Uitgevoerd door</label>
                      <input value={companyInfo.executedBy} onChange={(e)=>setCompanyInfo({...companyInfo, executedBy: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Scope (werkgebieden)</label>
                      <textarea value={scope.workAreasCovered || ''} onChange={(e)=>setScope({...scope, workAreasCovered: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Managementsysteem</label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={managementSystem.vca2Stars} onChange={(e)=>setManagementSystem({...managementSystem, vca2Stars: e.target.checked})} /><span>VCA 2-sterren</span></label>
                        <label className="flex items-center space-x-2"><input type="checkbox" checked={managementSystem.iso45001} onChange={(e)=>setManagementSystem({...managementSystem, iso45001: e.target.checked})} /><span>ISO 45001</span></label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Inventarisatie */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-6 w-6 text-blue-600" />
                    <span>STAP 2: Inventarisatie Risico's</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Doel:</strong> Identificeer alle gevaren per werkplek/activiteit
                    </p>
                  </div>

                  {/* Risk Template Browser */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">🎯 Gebruik een risicosjabloon</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplates(!showTemplates)}
                      >
                        {showTemplates ? 'Verberg sjablonen' : 'Toon sjablonen'}
                      </Button>
                    </div>
                    
                    {showTemplates && (
                      <div className="space-y-3 mt-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Filter op categorie
                          </label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Alle categorieën</option>
                            {Array.from(new Set(riskTemplates.map(t => t.category))).map(cat => (
                              <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                          {riskTemplates
                            .filter(t => !selectedCategory || t.category === selectedCategory)
                            .map((template) => (
                              <button
                                key={template.id}
                                type="button"
                                onClick={() => applyTemplate(template)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-sm text-gray-900">{template.title}</div>
                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">{template.controls}</div>
                              </button>
                            ))}
                        </div>
                        {riskTemplates.filter(t => !selectedCategory || t.category === selectedCategory).length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">Geen sjablonen gevonden</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Risk Input Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Risico Categorie *
                      </label>
                      <select
                        value={currentRisk.category}
                        onChange={(e) => setCurrentRisk({ ...currentRisk, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecteer categorie</option>
                        {Object.entries(RISK_CATEGORIES).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beschrijving Gevaar *
                      </label>
                      <textarea
                        value={currentRisk.description}
                        onChange={(e) => setCurrentRisk({ ...currentRisk, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Bijvoorbeeld: Oncomfortabele werkplek met onvoldoende ergonomische aanpassingen"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Locatie/Werkplek *
                        </label>
                        <input
                          type="text"
                          value={currentRisk.location}
                          onChange={(e) => setCurrentRisk({ ...currentRisk, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Bijvoorbeeld: Kantoor verdieping 2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Wie loopt risico?
                        </label>
                        <input
                          type="text"
                          value={currentRisk.affectedPersons}
                          onChange={(e) => setCurrentRisk({ ...currentRisk, affectedPersons: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Bijvoorbeeld: Administratief personeel"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Huidige Maatregelen
                      </label>
                      <textarea
                        value={currentRisk.currentMeasures}
                        onChange={(e) => setCurrentRisk({ ...currentRisk, currentMeasures: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Welke maatregelen zijn al getroffen?"
                      />
                    </div>

                    <Button onClick={addRisk} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      Risico Toevoegen
                    </Button>
                  </div>

                  {/* Current Risks List */}
                  {risks.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Geïnventariseerde Risico's ({risks.length})
                      </h3>
                      <div className="space-y-3">
                        {risks.map((risk) => (
                          <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-2">
                                  {RISK_CATEGORIES[risk.category as keyof typeof RISK_CATEGORIES]}
                                </Badge>
                                <p className="font-medium text-gray-900">{risk.description}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                  📍 {risk.location} | 👥 {risk.affectedPersons}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteRisk(risk.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Verwijder
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Risicobeoordeling */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-6 w-6 text-blue-600" />
                    <span>STAP 3: Risicobeoordeling (Ernst × Waarschijnlijkheid)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Toetsingsmethode:</strong> Bepaal voor elk risico de Ernst (E) en Waarschijnlijkheid (W).
                      De Risicoscore = E × W
                    </p>
                  </div>

                  {/* Risk Matrix Visual */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-x-auto">
                    <h3 className="font-medium text-gray-900 mb-3">Risicomatrix</h3>
                    <table className="min-w-full">
                      <thead>
                        <tr>
                          <th className="text-left text-sm font-medium text-gray-700 p-2">Ernst (E)</th>
                          <th className="text-center text-sm font-medium text-gray-700 p-2">W1</th>
                          <th className="text-center text-sm font-medium text-gray-700 p-2">W2</th>
                          <th className="text-center text-sm font-medium text-gray-700 p-2">W3</th>
                          <th className="text-center text-sm font-medium text-gray-700 p-2">W4</th>
                          <th className="text-center text-sm font-medium text-gray-700 p-2">W5</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[5, 4, 3, 2, 1].map((e) => (
                          <tr key={e}>
                            <td className="text-sm text-gray-700 p-2 font-medium">
                              E{e} {e === 5 ? '(Dodelijk)' : e === 4 ? '(Blijvend)' : e === 3 ? '(Matig)' : e === 2 ? '(Gering)' : '(Verwaarloosbaar)'}
                            </td>
                            {[1, 2, 3, 4, 5].map((w) => {
                              const score = e * w;
                              const riskClass = calculateRiskClass(score);
                              return (
                                <td
                                  key={w}
                                  className={`text-center p-2 text-sm font-medium ${getRiskClassColor(riskClass)} border`}
                                >
                                  {score}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">🟢 1-4: Laag</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">🟡 5-9: Matig</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">🟠 10-15: Hoog</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded">🔴 16-25: Zeer Hoog</span>
                    </div>
                  </div>

                  {/* Assess Each Risk */}
                  {risks.map((risk, index) => (
                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">
                        Risico {index + 1}: {risk.description}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ernst (E) *
                          </label>
                          {ERNST_LEVELS.map((level) => (
                            <label key={level.value} className="flex items-center space-x-2 mb-2">
                              <input
                                type="radio"
                                name={`ernst-${risk.id}`}
                                value={level.value}
                                checked={risk.ernst === level.value}
                                onChange={(e) => {
                                  const newRisks = risks.map(r =>
                                    r.id === risk.id
                                      ? {
                                          ...r,
                                          ernst: parseInt(e.target.value),
                                          riskScore: calculateRiskScore(parseInt(e.target.value), r.waarschijnlijkheid),
                                          riskClass: calculateRiskClass(calculateRiskScore(parseInt(e.target.value), r.waarschijnlijkheid)),
                                        }
                                      : r
                                  );
                                  setRisks(newRisks);
                                }}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {level.label} - {level.description}
                              </span>
                            </label>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Waarschijnlijkheid (W) *
                          </label>
                          {WAARSCHIJNLIJKHEID_LEVELS.map((level) => (
                            <label key={level.value} className="flex items-center space-x-2 mb-2">
                              <input
                                type="radio"
                                name={`waarschijnlijkheid-${risk.id}`}
                                value={level.value}
                                checked={risk.waarschijnlijkheid === level.value}
                                onChange={(e) => {
                                  const newRisks = risks.map(r =>
                                    r.id === risk.id
                                      ? {
                                          ...r,
                                          waarschijnlijkheid: parseInt(e.target.value),
                                          riskScore: calculateRiskScore(r.ernst, parseInt(e.target.value)),
                                          riskClass: calculateRiskClass(calculateRiskScore(r.ernst, parseInt(e.target.value))),
                                        }
                                      : r
                                  );
                                  setRisks(newRisks);
                                }}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">
                                {level.label} - {level.description}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {risk.ernst > 0 && risk.waarschijnlijkheid > 0 && (
                        <div className={`mt-4 p-3 rounded-lg border-2 ${getRiskClassColor(risk.riskClass)}`}>
                          <p className="font-medium">
                            Risicoscore: {risk.ernst} × {risk.waarschijnlijkheid} = <strong>{risk.riskScore}</strong>
                          </p>
                          <p className="text-sm mt-1">
                            Risicoklasse: <strong>{risk.riskClass.replace('_', ' ')}</strong>
                          </p>
                          <p className="text-sm mt-1">{getRiskClassAction(risk.riskClass)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Risicoklasse (Auto-calculated, just show summary) */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    <span>STAP 4: Risicoklasse Bepalen</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      De risicoklasse is automatisch bepaald op basis van de risicoscore.
                    </p>
                  </div>

                  {/* Summary by Risk Class */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['LAAG', 'MATIG', 'HOOG', 'ZEER_HOOG'].map((riskClass) => {
                      const count = risks.filter(r => r.riskClass === riskClass).length;
                      return (
                        <Card key={riskClass}>
                          <CardContent className="pt-6">
                            <div className={`text-center p-4 rounded-lg ${getRiskClassColor(riskClass)}`}>
                              <p className="text-3xl font-bold">{count}</p>
                              <p className="text-sm font-medium mt-1">
                                {riskClass.replace('_', ' ')} RISICO{count !== 1 ? "'S" : ''}
                              </p>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 text-center">
                              {getRiskClassAction(riskClass)}
                            </p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* List by Risk Class */}
                  {['ZEER_HOOG', 'HOOG', 'MATIG', 'LAAG'].map((riskClass) => {
                    const classRisks = risks.filter(r => r.riskClass === riskClass);
                    if (classRisks.length === 0) return null;

                    return (
                      <div key={riskClass} className="space-y-3">
                        <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                          <Badge className={getRiskClassColor(riskClass)}>
                            {riskClass.replace('_', ' ')}
                          </Badge>
                          <span>({classRisks.length})</span>
                        </h3>
                        {classRisks.map((risk) => (
                          <div key={risk.id} className="border border-gray-200 rounded-lg p-3">
                            <p className="font-medium text-gray-900">{risk.description}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              📍 {risk.location} | Score: {risk.riskScore} (E{risk.ernst} × W{risk.waarschijnlijkheid})
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Plan van Aanpak (korte invoer) */}
            {currentStep === 5 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wrench className="h-6 w-6 text-blue-600" />
                    <span>STAP 5: Plan van Aanpak</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                    Koppel per risico een maatregel, verantwoordelijke en streefdatum.
                  </div>
                  {risks.length === 0 && (
                    <p className="text-sm text-gray-600">Er zijn nog geen risico's om maatregelen aan te koppelen.</p>
                  )}
                  {risks.map((risk) => (
                    <div key={risk.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="text-sm font-medium text-gray-900">{risk.description}</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input placeholder="Maatregel" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input placeholder="Verantwoordelijke" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="date" className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Step 6: Betrokkenheid */}
            {currentStep === 6 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ClipboardList className="h-6 w-6 text-blue-600" />
                    <span>STAP 6: Betrokkenheid OR/PVT & Medewerkers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Datum bespreking OR/PVT</label>
                      <input type="date" value={involvement.orMeetingDate || ''} onChange={(e)=>setInvolvement({...involvement, orMeetingDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advies OR</label>
                      <select value={involvement.orAdvice || 'Geen'} onChange={(e)=>setInvolvement({...involvement, orAdvice: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Positief</option>
                        <option>Met opmerkingen</option>
                        <option>Geen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Opmerkingen</label>
                      <input value={involvement.orComments || ''} onChange={(e)=>setInvolvement({...involvement, orComments: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 7: Documenten checklist */}
            {currentStep === 7 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>STAP 7: Verplichte Documenten (Checklist)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Algemeen</p>
                      <label className="flex items-center space-x-2"><input type="checkbox" onChange={(e)=>setDocumentChecklist({ ...documentChecklist, general: { ...documentChecklist.general, policy: e.target.checked } })} /><span>Arbobeleid</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" onChange={(e)=>setDocumentChecklist({ ...documentChecklist, general: { ...documentChecklist.general, preventionOfficerAssigned: e.target.checked } })} /><span>Preventiemedewerker aangewezen</span></label>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">BHV & Noodsituaties</p>
                      <label className="flex items-center space-x-2"><input type="checkbox" onChange={(e)=>setDocumentChecklist({ ...documentChecklist, bhv: { ...documentChecklist.bhv, bhvPlan: e.target.checked } })} /><span>BHV-plan</span></label>
                      <label className="flex items-center space-x-2"><input type="checkbox" onChange={(e)=>setDocumentChecklist({ ...documentChecklist, bhv: { ...documentChecklist.bhv, evacuationPlan: e.target.checked } })} /><span>Ontruimingsplan</span></label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 8: Afronden & Opslaan */}
            {currentStep === 8 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PlayCircle className="h-6 w-6 text-blue-600" />
                    <span>STAP 8: Review & Opslaan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
                    Controleer je invoer en sla de RI&E op.
                  </div>
                  <Button onClick={handleSubmitAll}>
                    <Save className="mr-2 h-4 w-4" />
                    Opslaan
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Vorige
              </Button>
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 2 && risks.length === 0) ||
                  (currentStep === 3 && risks.some(r => r.ernst === 0 || r.waarschijnlijkheid === 0))
                }
              >
                Volgende
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

