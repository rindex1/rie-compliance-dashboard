"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext';

export default function RieComplianceDashboard() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-brand flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-200">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen gradient-brand text-gray-200 flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full text-center"
      >
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">
          RI&E Compliance Dashboard
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-2">
          Nederlandse RI&E (Risico-Inventarisatie & Evaluatie) Compliance Management
        </p>
        
        {/* Prompt Box */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mt-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Welkom bij het RI&E Dashboard
          </h2>
          <p className="text-lg text-gray-200 mb-6">
            Log in met uw bestaande account. Nieuwe accounts worden door een beheerder aangemaakt.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              className="bg-brand-gold text-gray-900 px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:opacity-90 transition-base w-full sm:w-auto"
            >
              <a href="/login">Inloggen</a>
            </Button>

            <div className="text-sm text-gray-300">
              Nog geen account? Neem contact op met uw beheerder.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-left">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span className="text-brand-gold">✓</span> Bestaand account?
            </h3>
            <p className="text-gray-300 text-sm">
              Log in met uw e-mailadres en wachtwoord om toegang te krijgen tot uw dashboard.
            </p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
              <span className="text-brand-gold">ℹ️</span> Nieuw hier?
            </h3>
            <p className="text-gray-300 text-sm">
              Vraag uw beheerder om een account voor u aan te maken.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  )
}
