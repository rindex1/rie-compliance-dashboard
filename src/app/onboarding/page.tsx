'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Bedrijfsgegevens',
    description: 'Basis informatie over uw organisatie',
    icon: Building2,
  },
  {
    id: 2,
    title: 'Team Samenstelling',
    description: 'RI&E-team en verantwoordelijkheden',
    icon: Users,
  },
  {
    id: 3,
    title: 'RI&E Opstarten',
    description: 'Start uw eerste risico-inventarisatie',
    icon: Shield,
  },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company info
    companyName: '',
    kvkNumber: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    employeeCount: '',
    sector: '',
    
    // Step 2: Team
    hasOR: false,
    hasPreventiemedewerker: false,
    hasArbodienst: false,
    preventionOfficer: '',
    arboDienst: '',
    
    // Step 3: RI&E basics
    hasExistingRIE: false,
    lastRIEDate: '',
    rieFrequency: '12', // months
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to RI&E wizard
      window.location.href = '/rie/new';
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const employeeCount = parseInt(formData.employeeCount) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welkom bij RI&E Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Laten we beginnen met het opzetten van uw compliance management
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="relative">
                  {index !== 0 && (
                    <div className={`absolute top-5 left-0 w-full h-0.5 -ml-[50%] ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep > step.id
                        ? 'bg-blue-600 text-white'
                        : currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {currentStep > step.id ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-medium text-gray-900">{step.title}</p>
                      <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-6 w-6 text-blue-600" })}
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Company Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrijfsnaam *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateFormData('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bijvoorbeeld: ABC BV"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      KVK-nummer *
                    </label>
                    <input
                      type="text"
                      value={formData.kvkNumber}
                      onChange={(e) => updateFormData('kvkNumber', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345678"
                      maxLength={8}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Straatnaam 123"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => updateFormData('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234 AB"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plaats *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Amsterdam"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefoonnummer
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+31 20 1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mailadres
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@bedrijf.nl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aantal medewerkers *
                    </label>
                    <input
                      type="number"
                      value={formData.employeeCount}
                      onChange={(e) => updateFormData('employeeCount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="1"
                      required
                    />
                    {employeeCount > 25 && (
                      <p className="mt-1 text-sm text-blue-600">
                        ℹ️ Verplichte OR-betrokkenheid bij {'>'} 25 medewerkers
                      </p>
                    )}
                    {employeeCount > 0 && employeeCount <= 25 && (
                      <p className="mt-1 text-sm text-gray-600">
                        ℹ️ Medewerkers raadplegen is verplicht
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sector *
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => updateFormData('sector', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecteer sector</option>
                      <option value="office">Kantoor</option>
                      <option value="manufacturing">Productie/Manufacturing</option>
                      <option value="healthcare">Zorgsector</option>
                      <option value="construction">Bouw & Constructie</option>
                      <option value="hospitality">Horeca</option>
                      <option value="retail">Detailhandel</option>
                      <option value="logistics">Logistiek</option>
                      <option value="education">Onderwijs</option>
                      <option value="other">Overig</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Team Setup */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    📋 Verplicht volgens Arbowet
                  </h3>
                  <p className="text-sm text-blue-800">
                    Een RI&E moet worden opgesteld met betrokkenheid van:
                  </p>
                  <ul className="mt-2 text-sm text-blue-800 space-y-1">
                    <li>• Werkgever/directie</li>
                    <li>• Preventiemedewerker</li>
                    <li>• OR/Personeelsvertegenwoordiging {employeeCount > 25 && '(verplicht)'}</li>
                    <li>• Arbodienst/deskundige</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.hasPreventiemedewerker}
                        onChange={(e) => updateFormData('hasPreventiemedewerker', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Heeft u een preventiemedewerker? *
                      </span>
                    </label>
                    {formData.hasPreventiemedewerker && (
                      <input
                        type="text"
                        value={formData.preventionOfficer}
                        onChange={(e) => updateFormData('preventionOfficer', e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Naam preventiemedewerker"
                      />
                    )}
                  </div>

                  {employeeCount > 25 && (
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.hasOR}
                          onChange={(e) => updateFormData('hasOR', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Heeft u een Ondernemingsraad (OR)? * (Verplicht bij {'>'} 25 medewerkers)
                        </span>
                      </label>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.hasArbodienst}
                        onChange={(e) => updateFormData('hasArbodienst', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Bent u aangesloten bij een arbodienst?
                      </span>
                    </label>
                    {formData.hasArbodienst && (
                      <input
                        type="text"
                        value={formData.arboDienst}
                        onChange={(e) => updateFormData('arboDienst', e.target.value)}
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Naam arbodienst"
                      />
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Let op:</strong> Het is wettelijk verplicht om medewerkers te betrekken bij de RI&E.
                    {employeeCount > 25 && ' Bij meer dan 25 medewerkers is OR-betrokkenheid verplicht.'}
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: RI&E Start */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center space-x-2 mb-4">
                    <input
                      type="checkbox"
                      checked={formData.hasExistingRIE}
                      onChange={(e) => updateFormData('hasExistingRIE', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Heeft u al een bestaande RI&E?
                    </span>
                  </label>

                  {formData.hasExistingRIE && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum laatste RI&E
                      </label>
                      <input
                        type="date"
                        value={formData.lastRIEDate}
                        onChange={(e) => updateFormData('lastRIEDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {formData.lastRIEDate && (
                        <p className="mt-2 text-sm text-gray-600">
                          {new Date(formData.lastRIEDate).getFullYear() < new Date().getFullYear() - 4
                            ? '⚠️ Let op: Uw RI&E is meer dan 4 jaar oud en moet verplicht worden herzien!'
                            : '✓ Uw RI&E is recent'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">
                    🎯 Klaar om te beginnen!
                  </h3>
                  <p className="text-sm text-green-800 mb-3">
                    U gaat nu uw RI&E opstellen volgens de 8-stappenplan:
                  </p>
                  <ol className="text-sm text-green-800 space-y-1 ml-4">
                    <li>1. Voorbereiding (Klaar!)</li>
                    <li>2. Inventarisatie risico's</li>
                    <li>3. Risicobeoordeling (Ernst × Waarschijnlijkheid)</li>
                    <li>4. Risicoklasse bepalen</li>
                    <li>5. Maatregelen bepalen</li>
                    <li>6. Plan van Aanpak opstellen</li>
                    <li>7. Uitvoering & Evaluatie</li>
                    <li>8. Documentatie & Actualisatie</li>
                  </ol>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">
                    📚 Wat gaan we inventariseren?
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Fysieke risico's (lawaai, trillingen, klimaat)</li>
                    <li>• Chemische risico's (stoffen, dampen)</li>
                    <li>• Biologische risico's (micro-organismen)</li>
                    <li>• Ergonomische risico's (tillen, beeldschermwerk)</li>
                    <li>• Psychosociale risico's (werkdruk, ongewenst gedrag)</li>
                    <li>• Organisatorische risico's (werktijden, procedures)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Vorige
              </Button>
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={
                  (currentStep === 1 && (!formData.companyName || !formData.kvkNumber || !formData.address || !formData.city || !formData.postalCode || !formData.employeeCount || !formData.sector)) ||
                  (currentStep === 2 && !formData.hasPreventiemedewerker)
                }
              >
                {currentStep === steps.length ? (
                  <>
                    Start RI&E <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Volgende'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal Notice */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Door verder te gaan, erkent u dat de RI&E moet voldoen aan de Arbowet.
            <br />
            Sancties bij ontbreken RI&E: Boete tot €90.000 (per overtreding)
          </p>
        </div>
      </div>
    </div>
  );
}

