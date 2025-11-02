export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          RI&E Compliance Dashboard
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Nederlandse RI&E (Risico-Inventarisatie & Evaluatie) Compliance Management
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/dashboard" 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
          >
            Ga naar Dashboard
          </a>
        </div>
        <div className="mt-16 bg-white rounded-lg p-8 shadow-xl max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✅ Applicatie is succesvol geladen!
          </h2>
          <p className="text-gray-600">
            De RI&E Compliance Dashboard applicatie draait nu lokaal. Klik op "Ga naar Dashboard" om te beginnen.
          </p>
        </div>
      </div>
    </div>
  );
}
