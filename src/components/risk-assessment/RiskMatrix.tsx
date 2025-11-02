'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';
import { Risk, RISK_LEVELS_DUTCH } from '@/lib/types';
import { getRiskLevelColor } from '@/lib/utils';

interface RiskMatrixProps {
  risks: Risk[];
  onAddRisk?: () => void;
  onEditRisk?: (risk: Risk) => void;
  onDeleteRisk?: (riskId: string) => void;
}

export function RiskMatrix({ risks, onAddRisk, onEditRisk, onDeleteRisk }: RiskMatrixProps) {
  const [selectedCell, setSelectedCell] = useState<{ probability: number; impact: number } | null>(null);

  // Create matrix data
  const matrixData = [];
  for (let impact = 5; impact >= 1; impact--) {
    for (let probability = 1; probability <= 5; probability++) {
      const score = probability * impact;
      const risksInCell = risks.filter(risk => 
        risk.probability === probability && risk.impact === impact
      );
      
      matrixData.push({
        probability,
        impact,
        score,
        risks: risksInCell,
        riskLevel: score >= 20 ? 'CRITICAL' : score >= 15 ? 'HIGH' : score >= 10 ? 'MEDIUM' : 'LOW'
      });
    }
  }

  const getCellColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-300 hover:bg-red-200';
      case 'HIGH':
        return 'bg-orange-100 border-orange-300 hover:bg-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200';
      case 'LOW':
        return 'bg-green-100 border-green-300 hover:bg-green-200';
      default:
        return 'bg-gray-100 border-gray-300 hover:bg-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Matrix Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Risico Matrix</h2>
          <p className="text-gray-600">Klik op een cel om risico's te bekijken of toe te voegen</p>
        </div>
        <Button onClick={onAddRisk}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuw Risico
        </Button>
      </div>

      {/* Matrix Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Waarschijnlijkheid × Impact Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-1 max-w-4xl mx-auto">
            {/* Header row */}
            <div className="text-center font-semibold text-sm text-gray-600">Impact</div>
            <div className="text-center font-semibold text-sm text-gray-600">5</div>
            <div className="text-center font-semibold text-sm text-gray-600">4</div>
            <div className="text-center font-semibold text-sm text-gray-600">3</div>
            <div className="text-center font-semibold text-sm text-gray-600">2</div>
            <div className="text-center font-semibold text-sm text-gray-600">1</div>

            {/* Matrix cells */}
            {matrixData.map((cell, index) => (
              <div
                key={index}
                className={`
                  relative min-h-[80px] border-2 rounded-lg p-2 cursor-pointer transition-colors
                  ${getCellColor(cell.riskLevel)}
                  ${selectedCell?.probability === cell.probability && selectedCell?.impact === cell.impact 
                    ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => setSelectedCell({ probability: cell.probability, impact: cell.impact })}
              >
                <div className="text-center">
                  <div className="text-xs font-semibold">
                    {cell.probability}×{cell.impact}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Score: {cell.score}
                  </div>
                  {cell.risks.length > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {cell.risks.length} risico's
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Probability labels */}
            <div className="text-center font-semibold text-sm text-gray-600">Waarschijnlijkheid</div>
            <div className="text-center font-semibold text-sm text-gray-600">1</div>
            <div className="text-center font-semibold text-sm text-gray-600">2</div>
            <div className="text-center font-semibold text-sm text-gray-600">3</div>
            <div className="text-center font-semibold text-sm text-gray-600">4</div>
            <div className="text-center font-semibold text-sm text-gray-600">5</div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Cell Details */}
      {selectedCell && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>
                Risico's in cel {selectedCell.probability}×{selectedCell.impact}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const cellRisks = risks.filter(risk => 
                risk.probability === selectedCell.probability && risk.impact === selectedCell.impact
              );
              
              if (cellRisks.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Geen risico's in deze cel</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        onAddRisk?.();
                        setSelectedCell(null);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Risico toevoegen
                    </Button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {cellRisks.map((risk) => (
                    <div key={risk.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium">{risk.title}</h3>
                          <Badge className={getRiskLevelColor(risk.riskLevel)}>
                            {RISK_LEVELS_DUTCH[risk.riskLevel]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Locatie: {risk.location}</span>
                          <span>Blootgestelde medewerkers: {risk.exposedEmployees}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditRisk?.(risk)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDeleteRisk?.(risk.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Risico Niveaus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm">Laag (1-9)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-sm">Gemiddeld (10-14)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span className="text-sm">Hoog (15-19)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm">Kritiek (20-25)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
