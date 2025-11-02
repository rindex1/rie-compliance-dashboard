'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function RegisterPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  return (
    <div className="min-h-screen gradient-brand flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Account aanmaken uitgeschakeld</CardTitle>
          <CardDescription className="text-center">
            Accounts worden door een beheerder aangemaakt en voorzien van een licentie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center text-gray-700">
            <p>Neem contact op met uw beheerder om toegang te krijgen.</p>
            <p>
              Heeft u al een account?{' '}
              <Link href="/login" className="text-brand-gold hover:underline">Log hier in</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
