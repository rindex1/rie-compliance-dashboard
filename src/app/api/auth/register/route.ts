import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens zijn'),
  companyName: z.string().min(1, 'Bedrijfsnaam is verplicht'),
});

export async function POST(request: NextRequest) {
  // Registration disabled - users are created via admin tool
  // Stripe payment flow is ready but disabled until app is ready for public use
  return NextResponse.json(
    { error: 'Registratie is uitgeschakeld. Neem contact op met de beheerder.' },
    { status: 403 }
  );
}


