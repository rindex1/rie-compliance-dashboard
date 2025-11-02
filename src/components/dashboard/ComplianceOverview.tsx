'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { ComplianceOverview as ComplianceOverviewType } from '@/lib/types';
import { getComplianceStatusColor } from '@/lib/utils';

interface ComplianceOverviewProps {
  data: ComplianceOverviewType;
}

export function ComplianceOverview({ data }: ComplianceOverviewProps) {
  const { overallScore, criticalAreas, openRisks, resolvedRisks, daysUntilReview, urgentActions } = data;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Compliance Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Algemene Compliance Score
          </CardTitle>
          <Shield className="h-4 w-4 text-brand-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-brand-gold">{overallScore}%</div>
          <div className="flex items-center space-x-2">
            <Progress value={overallScore} className="flex-1" />
            <span className={`text-sm font-medium ${getComplianceStatusColor(overallScore)}`}>
              {overallScore >= 90 ? 'Uitstekend' : overallScore >= 70 ? 'Goed' : 'Aandacht vereist'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Risico Overzicht
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-brand-gold" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-red-600">{openRisks}</div>
              <p className="text-xs text-muted-foreground">Open Risico's</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{resolvedRisks}</div>
              <p className="text-xs text-muted-foreground">Opgelost</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Days Until Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Volgende Beoordeling
          </CardTitle>
          <Clock className="h-4 w-4 text-brand-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {daysUntilReview > 0 ? `${daysUntilReview} dagen` : 'Overdue'}
          </div>
          <p className="text-xs text-muted-foreground">
            {daysUntilReview > 0 ? 'tot volgende verplichte beoordeling' : 'Beoordeling is achterstallig'}
          </p>
        </CardContent>
      </Card>

      {/* Urgent Actions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Urgente Acties
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-brand-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{urgentActions}</div>
          <p className="text-xs text-muted-foreground">
            Acties vereisen directe aandacht
          </p>
        </CardContent>
      </Card>

      {/* Critical Areas */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Kritieke Gebieden</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {criticalAreas.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    area.status === 'red' ? 'bg-red-500' : 
                    area.status === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                  }`} />
                  <span className="font-medium">{area.category}</span>
                </div>
                <Badge variant="outline" className="ml-2">
                  {area.count} risico's
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
