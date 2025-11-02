export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'EXTERNAL_ADVISOR';
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface License {
  id: string;
  userId: string;
  plan: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  kvkNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Risk {
  id: string;
  assessmentId: string;
  companyId: string;
  category: 'PHYSICAL_WORKSPACE' | 'CHEMICAL_BIOLOGICAL' | 'PSYCHOSOCIAL' | 'PHYSICAL_STRAIN' | 'SAFETY_RISKS' | 'ENVIRONMENTAL';
  title: string;
  description: string;
  location: string;
  department?: string;
  probability: number; // 1-5 scale
  impact: number; // 1-5 scale
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  exposedEmployees: number;
  currentMeasures: string[];
  proposedMeasures: string[];
  status: string;
  createdDate: Date;
  reviewDate?: Date;
  attachments: string[];
}

export interface Assessment {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'ARCHIVED';
  version: number;
  assessorId: string;
  startDate: Date;
  endDate?: Date;
  reviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Action {
  id: string;
  assessmentId?: string;
  riskId?: string;
  companyId: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  assignedToId?: string;
  dueDate?: Date;
  completedDate?: Date;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Countermeasure {
  id: string;
  riskId: string;
  description: string;
  type: 'ELIMINATE' | 'REDUCE' | 'CONTROL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  cost?: number;
  timeline?: {
    startDate: Date;
    endDate: Date;
    milestones: string[];
  };
  responsible?: string;
  effectiveness?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceOverview {
  overallScore: number;
  criticalAreas: {
    category: string;
    status: 'red' | 'orange' | 'green';
    count: number;
  }[];
  openRisks: number;
  resolvedRisks: number;
  daysUntilReview: number;
  urgentActions: number;
}

export interface RiskCategoryStats {
  category: string;
  totalRisks: number;
  highRiskCount: number;
  criticalRiskCount: number;
  averageScore: number;
}

export interface DashboardData {
  complianceOverview: ComplianceOverview;
  riskCategories: RiskCategoryStats[];
  recentActions: Action[];
  upcomingDeadlines: Action[];
  complianceTrend: {
    date: string;
    score: number;
  }[];
}

// Dutch translations for UI
export const RISK_CATEGORIES_DUTCH = {
  PHYSICAL_WORKSPACE: 'Fysieke werkplek',
  CHEMICAL_BIOLOGICAL: 'Chemische/biologische gevaren',
  PSYCHOSOCIAL: 'Psychosociale factoren',
  PHYSICAL_STRAIN: 'Fysieke belasting',
  SAFETY_RISKS: 'Veiligheidsrisico\'s',
  ENVIRONMENTAL: 'Omgevingsfactoren'
} as const;

export const RISK_LEVELS_DUTCH = {
  LOW: 'Laag',
  MEDIUM: 'Gemiddeld',
  HIGH: 'Hoog',
  CRITICAL: 'Kritiek'
} as const;

export const ACTION_PRIORITIES_DUTCH = {
  LOW: 'Laag',
  MEDIUM: 'Gemiddeld',
  HIGH: 'Hoog',
  URGENT: 'Urgent'
} as const;

export const ACTION_STATUS_DUTCH = {
  PENDING: 'In behandeling',
  IN_PROGRESS: 'In uitvoering',
  COMPLETED: 'Voltooid',
  OVERDUE: 'Achterstallig',
  CANCELLED: 'Geannuleerd'
} as const;

// RI&E Template data structures (for full-from-scratch flow)
export interface RieCompanyInfo {
  companyName: string;
  address: string;
  chamberOfCommerceNumber?: string;
  employeeCount: number;
  industry: string;
  assessmentDate: string; // ISO date
  executedBy: string; // name + role
  preventionExpert?: string; // arbodienst/adviseur
  validUntil?: string; // ISO date
  version?: string;
}

export interface RieScope {
  workAreasCovered: string; // description
  employeeGroups: string[]; // e.g., ['vast', 'tijdelijk', ...]
  riskDomains: string[]; // physical, psychosocial, organizational, etc.
  specialGroups: string[]; // pregnant, youth, older, etc.
}

export interface RieManagementSystem {
  vca2Stars: boolean;
  iso45001: boolean;
  notes?: string;
}

export interface RieRiskMethod {
  probabilityScale: 1 | 2 | 3 | 4 | 5;
  severityScale: 1 | 2 | 3 | 4 | 5;
  matrixNotes?: string;
}

export interface RieRiskItem {
  riskId: string;
  workArea: string; // name of area/function
  category: string; // domain/category per section
  title: string;
  description: string;
  location?: string;
  currentMeasures?: string[];
  probability: 1 | 2 | 3 | 4 | 5; // Kans (K)
  severity: 1 | 2 | 3 | 4 | 5; // Ernst (E)
  score: number; // K x E
  residualRisk?: string; // qualitative
  additionalMeasuresNeeded?: boolean;
}

export interface RiePlanActionItem {
  id: string;
  riskRef?: string; // riskId reference
  riskScore?: number;
  measure: string;
  owner: string;
  targetDate?: string; // ISO date
  status: 'TO_START' | 'IN_PROGRESS' | 'DONE';
  effectivenessChecked?: boolean;
}

export interface RieInvolvement {
  orMeetingDate?: string; // OR/PVT date
  attendees?: string[];
  orAdvice?: 'Positief' | 'Met opmerkingen' | 'Geen';
  orComments?: string;
  participants: Array<{ name: string; role: string; date: string }>;
  method: Array<'Interviews' | 'Werkplekbezoeken' | 'Vragenlijsten' | 'Werkoverleg'>;
}

export interface RieAbsenteeismStats {
  percentage?: number;
  avgDurationDays?: number;
  frequencyPerEmployee?: number;
  mainCauses?: Array<{ cause: string; percentage?: number }>;
  relationToRisks?: string;
}

export interface RieIncidentRecord {
  date: string;
  incident: string;
  severity: string;
  absence: string;
  cause?: string;
  measuresTaken?: string;
  inspectorateNotified?: boolean;
  inspectorateNotes?: string;
}

export interface RieArboServiceInfo {
  serviceName?: string;
  companyDoctor?: string;
  contractType?: string;
  lastContactDate?: string;
  involvement: {
    adviceOnRisks?: boolean;
    absenteeismDataAnalyzed?: boolean;
    specialGroupsDiscussed?: boolean;
    pagoPolicyAligned?: boolean;
    actionPlanReviewed?: boolean;
  };
  doctorPointsOfAttention?: string[];
}

export interface RieDocumentChecklist {
  general: {
    policy?: boolean;
    preventionOfficerAssigned?: boolean;
    preventionOfficerTasksDescribed?: boolean;
    sectorCatalog?: boolean;
  };
  bhv: {
    bhvPlan?: boolean;
    evacuationPlan?: boolean;
    bhvAssignedAndTrained?: boolean;
    evacuationDrillsDocumented?: boolean;
  };
  hazardousSubstances: {
    registry?: boolean;
    safetyDataSheets?: boolean;
    occupationalMeasurements?: boolean;
  };
  machinesTools: {
    ceDeclarations?: boolean;
    manuals?: boolean;
    maintenanceContracts?: boolean;
    liftingGearInspectionReports?: boolean;
  };
  specificGroups: {
    pregnancyProtocol?: boolean;
    youthProtocol?: boolean;
    reintegrationPolicy?: boolean;
  };
  registrations: {
    accidents?: boolean;
    occupationalDiseases?: boolean;
    nearMisses?: boolean;
  };
}

export interface RieEvaluationPlan {
  periodic: {
    yearly?: boolean;
    managementReview?: boolean;
    quarterlyWorkMeetings?: boolean;
  };
  changes: {
    newProcesses?: boolean;
    newMachinesOrSubstances?: boolean;
    renovationOrMove?: boolean;
    newLegislation?: boolean;
    seriousAccidents?: boolean;
    structuralAbsenteeism?: boolean;
    reorganization?: boolean;
    staffIncreaseOver25Percent?: boolean;
  };
  pvaQuarterlyEvaluation?: Array<{
    quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    date?: string;
    measuresCompleted?: number;
    remainingActions?: number;
    notes?: string;
  }>;
}

export interface RieSignOffs {
  employer: { name: string; role: string; date: string; signed?: boolean };
  worksCouncil?: { name: string; role: string; date: string; signed?: boolean };
  preventionOfficer?: { name: string; date: string; signed?: boolean };
}

export interface RieAttachments {
  consultedDocuments?: string[];
  absenteeismReports?: string[];
  accidentRegister?: string[];
  doctorAdvice?: string[];
  inspectionReports?: string[];
  measurementReports?: string[]; // sound, climate, air
  certificatesAndInspections?: string[]; // electrical, lifting, pressure vessels
  bhvDocuments?: string[]; // certificates, drill reports
}

export interface RieContacts {
  arboService?: { name?: string; phone?: string };
  companyDoctor?: { name?: string; phone?: string };
  preventionOfficer?: { name?: string; phone?: string };
  labourInspectorate?: { phone?: string; website?: string };
}

export interface RieData {
  company: RieCompanyInfo;
  goalAndScope: {
    goals: string[];
    scope: RieScope;
  };
  managementSystem: RieManagementSystem;
  riskMethod: RieRiskMethod;
  workAreas: Array<{
    name: string;
    headcount?: number;
    activities?: string;
    inventoriedOn?: string;
    withEmployees?: string[];
    risks: RieRiskItem[];
  }>;
  planOfApproach: RiePlanActionItem[];
  involvement: RieInvolvement;
  absenteeism?: RieAbsenteeismStats;
  incidents?: RieIncidentRecord[];
  arboService?: RieArboServiceInfo;
  documentChecklist?: RieDocumentChecklist;
  evaluationPlan?: RieEvaluationPlan;
  signOffs?: RieSignOffs;
  attachments?: RieAttachments;
  contacts?: RieContacts;
}
