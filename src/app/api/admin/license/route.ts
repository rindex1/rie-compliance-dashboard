import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { isProvisionAuthorized } from '@/lib/admin-auth';

const assignSchema = z.object({
  userId: z.string().min(1),
  plan: z.enum(['SUPERUSER', 'ADMIN'], { errorMap: () => ({ message: 'Plan moet SUPERUSER of ADMIN zijn' }) }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED']).default('ACTIVE'),
  accountLimit: z.number().int().positive().optional().nullable(), // Account limit for SUPERUSER plans
  expiresAt: z.string().datetime().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database niet geconfigureerd' },
        { status: 503 }
      );
    }

    if (!isProvisionAuthorized(request)) {
      return NextResponse.json(
        { error: 'Niet geautoriseerd' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = assignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const { userId, plan, status, accountLimit, expiresAt } = parsed.data;

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    // Only set accountLimit for SUPERUSER plans, null for ADMIN
    const effectiveAccountLimit = plan === 'SUPERUSER' ? (accountLimit ?? null) : null;

    const license = await prisma.license.upsert({
      where: { userId },
      update: { 
        plan, 
        status, 
        accountLimit: effectiveAccountLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null 
      },
      create: { 
        userId, 
        plan, 
        status, 
        accountLimit: effectiveAccountLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined 
      },
      select: { userId: true, plan: true, status: true, accountLimit: true, expiresAt: true },
    });

    return NextResponse.json({ message: 'Licentie bijgewerkt', license });
  } catch (error) {
    console.error('Admin license assign error:', error);
    return NextResponse.json(
      { error: 'Interne serverfout' },
      { status: 500 }
    );
  }
}


