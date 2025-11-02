import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { RiskLevel } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate risk level based on probability and impact
export function calculateRiskLevel(probability: number, impact: number): RiskLevel {
  const score = probability * impact;
  
  if (score >= 20) return 'CRITICAL';
  if (score >= 15) return 'HIGH';
  if (score >= 10) return 'MEDIUM';
  return 'LOW';
}

// Get risk level color for UI
export function getRiskLevelColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Get priority color for UI
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'URGENT':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'LOW':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Get status color for UI
export function getStatusColor(status: string): string {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

// Format date for Dutch locale
export function formatDateDutch(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Format date for Dutch locale with time
export function formatDateTimeDutch(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Calculate days until deadline
export function getDaysUntilDeadline(date: Date): number {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check if action is overdue
export function isOverdue(date: Date): boolean {
  return getDaysUntilDeadline(date) < 0;
}

// Generate compliance score based on risks and actions
export function calculateComplianceScore(
  totalRisks: number,
  criticalRisks: number,
  highRisks: number,
  completedActions: number,
  totalActions: number
): number {
  if (totalRisks === 0) return 100;
  
  const riskPenalty = (criticalRisks * 20) + (highRisks * 10);
  const actionBonus = totalActions > 0 ? (completedActions / totalActions) * 20 : 0;
  
  const score = Math.max(0, 100 - riskPenalty + actionBonus);
  return Math.round(score);
}

// Get compliance status color
export function getComplianceStatusColor(score: number): string {
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

// Validate Dutch postal code
export function isValidDutchPostalCode(postalCode: string): boolean {
  const dutchPostalCodeRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/;
  return dutchPostalCodeRegex.test(postalCode);
}

// Validate Dutch KVK number
export function isValidKVKNumber(kvkNumber: string): boolean {
  const kvkRegex = /^[0-9]{8}$/;
  return kvkRegex.test(kvkNumber);
}

// Format currency for Dutch locale
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Generate unique filename for uploads
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}_${randomString}.${extension}`;
}

// Sanitize filename for safe storage
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}
