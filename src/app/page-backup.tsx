import Link from 'next/link';
import { Shield, CheckCircle, FileText, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RI&E Compliance Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Een uitgebreide web-gebaseerde RI&E (Risico-Inventarisatie & Evaluatie) 
            ontwerper applicatie die Nederlandse bedrijven helpt bij het identificeren 
            van werkplekrisico's, implementeren van tegenmaatregelen en het onderhouden 
            van compliance met Arbeidsinspectie regelgeving.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/dashboard"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ga naar Dashboard
            </Link>
            <Link
              href="/login"
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Inloggen
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Compliance Monitoring
              </h3>
              <p className="text-gray-600">
                Real-time monitoring van compliance status met visuele indicatoren
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Actie Management
              </h3>
              <p className="text-gray-600">
                Prioriteitsgebaseerde actie tracking met deadline monitoring
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Document Export
              </h3>
              <p className="text-gray-600">
                Automatische generatie van RI&E rapporten en actieplannen
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Samenwerking
              </h3>
              <p className="text-gray-600">
                Multi-user ondersteuning met rolgebaseerde toegang
              </p>
            </div>
          </div>
        </div>

        {/* Dutch Compliance Features */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Nederlandse Arbeidsinspectie Compliance
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Arbeidsomstandighedenwet
              </h3>
              <p className="text-gray-600">
                Ingebouwde controles voor alle Arbeidsomstandighedenwet vereisten
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sector-specifieke Arbocatalogi
              </h3>
              <p className="text-gray-600">
                Integratie met relevante arbocatalogus voor uw sector
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                BHV Planning
              </h3>
              <p className="text-gray-600">
                Tools voor Bedrijfshulpverlening en noodsituatie planning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
