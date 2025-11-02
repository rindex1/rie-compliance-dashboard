'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Give webhook time to process
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  }, [sessionId]);

  return (
    <div className="min-h-screen gradient-brand flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === 'loading' && 'Betaling verwerken...'}
            {status === 'success' && 'Betaling succesvol!'}
            {status === 'error' && 'Betaling mislukt'}
          </CardTitle>
          <CardDescription className="text-center">
            {status === 'loading' && 'Uw licentie wordt toegewezen...'}
            {status === 'success' && 'Uw account is geactiveerd. U kunt nu inloggen.'}
            {status === 'error' && 'Er is een probleem opgetreden. Neem contact op als de betaling is verwerkt.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md text-center">
                <p className="text-green-800 font-medium">
                  ✅ Uw licentie is geactiveerd
                </p>
                <p className="text-green-600 text-sm mt-2">
                  U kunt nu inloggen met uw account
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Naar inloggen
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                <p className="text-yellow-800 text-sm">
                  Als uw betaling succesvol was, kan het even duren voordat uw account is geactiveerd.
                  Probeer over een paar minuten opnieuw in te loggen.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="flex-1"
                >
                  Inloggen
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/register')}
                  className="flex-1"
                >
                  Terug
                </Button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-gold mx-auto"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

