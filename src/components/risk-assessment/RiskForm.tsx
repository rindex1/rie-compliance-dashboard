'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Save, X } from 'lucide-react';
import { Risk, RISK_CATEGORIES_DUTCH } from '@/lib/types';
import { calculateRiskLevel } from '@/lib/utils';

const riskSchema = z.object({
  category: z.enum(['PHYSICAL_WORKSPACE', 'CHEMICAL_BIOLOGICAL', 'PSYCHOSOCIAL', 'PHYSICAL_STRAIN', 'SAFETY_RISKS', 'ENVIRONMENTAL']),
  title: z.string().min(1, 'Titel is verplicht'),
  description: z.string().min(1, 'Beschrijving is verplicht'),
  location: z.string().min(1, 'Locatie is verplicht'),
  department: z.string().optional(),
  probability: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
  exposedEmployees: z.number().min(0),
  currentMeasures: z.array(z.string()).optional(),
  proposedMeasures: z.array(z.string()).optional(),
});

type RiskFormData = z.infer<typeof riskSchema>;

interface RiskFormProps {
  risk?: Risk;
  onSubmit: (data: RiskFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function RiskForm({ risk, onSubmit, onCancel, loading = false }: RiskFormProps) {
  const [currentMeasures, setCurrentMeasures] = useState<string[]>(risk?.currentMeasures || []);
  const [proposedMeasures, setProposedMeasures] = useState<string[]>(risk?.proposedMeasures || []);
  const [newMeasure, setNewMeasure] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RiskFormData>({
    resolver: zodResolver(riskSchema),
    defaultValues: {
      category: risk?.category || 'PHYSICAL_WORKSPACE',
      title: risk?.title || '',
      description: risk?.description || '',
      location: risk?.location || '',
      department: risk?.department || '',
      probability: risk?.probability || 1,
      impact: risk?.impact || 1,
      exposedEmployees: risk?.exposedEmployees || 0,
    },
  });

  const watchedProbability = watch('probability');
  const watchedImpact = watch('impact');
  const calculatedRiskLevel = calculateRiskLevel(watchedProbability, watchedImpact);

  const addMeasure = (type: 'current' | 'proposed') => {
    if (newMeasure.trim()) {
      if (type === 'current') {
        setCurrentMeasures([...currentMeasures, newMeasure.trim()]);
      } else {
        setProposedMeasures([...proposedMeasures, newMeasure.trim()]);
      }
      setNewMeasure('');
    }
  };

  const removeMeasure = (type: 'current' | 'proposed', index: number) => {
    if (type === 'current') {
      setCurrentMeasures(currentMeasures.filter((_, i) => i !== index));
    } else {
      setProposedMeasures(proposedMeasures.filter((_, i) => i !== index));
    }
  };

  const handleFormSubmit = (data: RiskFormData) => {
    onSubmit({
      ...data,
      currentMeasures,
      proposedMeasures,
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{risk ? 'Risico Bewerken' : 'Nieuw Risico Toevoegen'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(RISK_CATEGORIES_DUTCH).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Afdeling
              </label>
              <input
                {...register('department')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bijv. Productie, Kantoor, Magazijn"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Korte beschrijving van het risico"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beschrijving *
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Gedetailleerde beschrijving van het risico"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Locatie *
            </label>
            <input
              {...register('location')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Specifieke locatie waar het risico zich voordoet"
            />
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Risk Assessment */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risico Beoordeling</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waarschijnlijkheid (1-5) *
                </label>
                <select
                  {...register('probability', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - Zeer onwaarschijnlijk</option>
                  <option value={2}>2 - Onwaarschijnlijk</option>
                  <option value={3}>3 - Mogelijk</option>
                  <option value={4}>4 - Waarschijnlijk</option>
                  <option value={5}>5 - Zeer waarschijnlijk</option>
                </select>
                {errors.probability && (
                  <p className="text-red-600 text-sm mt-1">{errors.probability.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Impact (1-5) *
                </label>
                <select
                  {...register('impact', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - Verwaarloosbaar</option>
                  <option value={2}>2 - Klein</option>
                  <option value={3}>3 - Gemiddeld</option>
                  <option value={4}>4 - Groot</option>
                  <option value={5}>5 - Zeer groot</option>
                </select>
                {errors.impact && (
                  <p className="text-red-600 text-sm mt-1">{errors.impact.message}</p>
                )}
              </div>
            </div>

            {/* Risk Level Display */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Berekend Risico Niveau:</span>
                <Badge className={`px-3 py-1 ${
                  calculatedRiskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  calculatedRiskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  calculatedRiskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {calculatedRiskLevel === 'CRITICAL' ? 'Kritiek' :
                   calculatedRiskLevel === 'HIGH' ? 'Hoog' :
                   calculatedRiskLevel === 'MEDIUM' ? 'Gemiddeld' : 'Laag'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Score: {watchedProbability} × {watchedImpact} = {watchedProbability * watchedImpact}
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aanvullende Informatie</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Aantal blootgestelde medewerkers
              </label>
              <input
                {...register('exposedEmployees', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Current Measures */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Huidige Maatregelen
              </label>
              <div className="space-y-2">
                {currentMeasures.map((measure, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md">{measure}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMeasure('current', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMeasure}
                    onChange={(e) => setNewMeasure(e.target.value)}
                    placeholder="Nieuwe maatregel toevoegen"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addMeasure('current')}
                  >
                    Toevoegen
                  </Button>
                </div>
              </div>
            </div>

            {/* Proposed Measures */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voorgestelde Maatregelen
              </label>
              <div className="space-y-2">
                {proposedMeasures.map((measure, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-md">{measure}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMeasure('proposed', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMeasure}
                    onChange={(e) => setNewMeasure(e.target.value)}
                    placeholder="Nieuwe maatregel toevoegen"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addMeasure('proposed')}
                  >
                    Toevoegen
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Opslaan...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Opslaan</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
