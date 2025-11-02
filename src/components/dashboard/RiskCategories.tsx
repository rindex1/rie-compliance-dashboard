'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Shield,
  Zap,
  Heart,
  Flame
} from 'lucide-react';
import { RiskCategoryStats, RISK_CATEGORIES_DUTCH } from '@/lib/types';
import { getRiskLevelColor } from '@/lib/utils';

interface RiskCategoriesProps {
  data: RiskCategoryStats[];
}

const categoryIcons = {
  PHYSICAL_WORKSPACE: Shield,
  CHEMICAL_BIOLOGICAL: AlertTriangle,
  PSYCHOSOCIAL: Heart,
  PHYSICAL_STRAIN: Users,
  SAFETY_RISKS: Flame,
  ENVIRONMENTAL: Zap
};

export function RiskCategories({ data }: RiskCategoriesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-brand-gold" />
          <span>Risico Categorieën</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((category) => {
            const Icon = categoryIcons[category.category as keyof typeof categoryIcons] || AlertTriangle;
            const criticalPercentage = category.totalRisks > 0 
              ? (category.criticalRiskCount / category.totalRisks) * 100 
              : 0;
            const highPercentage = category.totalRisks > 0 
              ? (category.highRiskCount / category.totalRisks) * 100 
              : 0;

            return (
              <div key={category.category} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-brand-gold" />
                    <span className="font-medium">
                      {RISK_CATEGORIES_DUTCH[category.category as keyof typeof RISK_CATEGORIES_DUTCH]}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {category.totalRisks} totaal
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Kritieke risico's</span>
                    <span className="font-medium text-red-600">{category.criticalRiskCount}</span>
                  </div>
                  <Progress value={criticalPercentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Hoge risico's</span>
                    <span className="font-medium text-orange-600">{category.highRiskCount}</span>
                  </div>
                  <Progress value={highPercentage} className="h-2" />
                </div>

                <div className="flex justify-between text-sm">
                  <span>Gemiddelde score</span>
                  <span className="font-medium">{category.averageScore.toFixed(1)}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <Badge 
                      className={getRiskLevelColor(
                        category.criticalRiskCount > 0 ? 'CRITICAL' :
                        category.highRiskCount > 0 ? 'HIGH' :
                        category.averageScore > 15 ? 'MEDIUM' : 'LOW'
                      )}
                    >
                      {category.criticalRiskCount > 0 ? 'Kritiek' :
                       category.highRiskCount > 0 ? 'Hoog' :
                       category.averageScore > 15 ? 'Gemiddeld' : 'Laag'}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
