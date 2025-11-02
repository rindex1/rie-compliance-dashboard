import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(1, 'Wachtwoord is verplicht'),
});

export async function POST(request: NextRequest) {
  try {
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database niet geconfigureerd' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        companyId: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres of wachtwoord' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Ongeldig e-mailadres of wachtwoord' },
        { status: 401 }
      );
    }

    // Check license status (ADMIN users don't need licenses)
    if (user.role !== 'ADMIN') {
      const license = await prisma.license.findUnique({
        where: { userId: user.id },
        select: { status: true, expiresAt: true },
      });

      if (!license || license.status !== 'ACTIVE' || (license.expiresAt && new Date(license.expiresAt) < new Date())) {
        return NextResponse.json(
          { error: 'Geen actieve licentie. Neem contact op met de beheerder.' },
          { status: 403 }
        );
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId || undefined,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Inloggen succesvol',
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    
    // Provide more helpful error messages
    let errorMessage = 'Interne serverfout';
    if (error?.code === 'P2025') {
      errorMessage = 'Gebruiker niet gevonden';
    } else if (error?.message?.includes('enum')) {
      errorMessage = 'Database schema fout. Neem contact op met de beheerder.';
    } else if (error?.message) {
      errorMessage = `Fout: ${error.message}`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}


