import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import { isProvisionAuthorized } from '@/lib/admin-auth';

const provisionSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  name: z.string().min(2, 'Naam moet minimaal 2 tekens zijn'),
  password: z.string().min(8, 'Wachtwoord moet minimaal 8 tekens zijn'),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'EXTERNAL_ADVISOR']).default('MANAGER'),
  license: z.object({
    plan: z.enum(['SUPERUSER', 'ADMIN'], { errorMap: () => ({ message: 'Licentieplan moet SUPERUSER of ADMIN zijn' }) }),
    status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED', 'SUSPENDED']).default('ACTIVE'),
    accountLimit: z.number().int().positive().optional().nullable(), // Only for SUPERUSER plans
    expiresAt: z.string().datetime().optional().nullable(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database niet geconfigureerd' },
        { status: 503 }
      );
    }

    // Check authorization: provision token OR authenticated superuser/admin
    const hasProvisionToken = isProvisionAuthorized(request);
    let requesterUserId: string | null = null;
    let canCreateUnlimited = hasProvisionToken;

    if (!hasProvisionToken) {
      // Check if user is authenticated and has SUPERUSER or ADMIN plan
      const currentUser = getUserFromRequest(request);
      if (!currentUser) {
        return NextResponse.json(
          { error: 'Niet geautoriseerd' },
          { status: 401 }
        );
      }

      const requesterLicense = await prisma.license.findUnique({
        where: { userId: currentUser.userId },
        select: { plan: true, status: true, accountLimit: true, expiresAt: true },
      });

      if (!requesterLicense || requesterLicense.status !== 'ACTIVE' || 
          (requesterLicense.expiresAt && new Date(requesterLicense.expiresAt) < new Date())) {
        return NextResponse.json(
          { error: 'Geen actieve licentie' },
          { status: 403 }
        );
      }

      if (requesterLicense.plan === 'ADMIN') {
        canCreateUnlimited = true;
      } else if (requesterLicense.plan === 'SUPERUSER') {
        // Check account limit for superuser
        const assignedCount = await prisma.user.count({
          where: { assignedById: currentUser.userId },
        });

        if (requesterLicense.accountLimit !== null && assignedCount >= requesterLicense.accountLimit) {
          return NextResponse.json(
            { 
              error: `Account limiet bereikt. U heeft ${assignedCount} van ${requesterLicense.accountLimit} accounts toegewezen.`,
              limit: requesterLicense.accountLimit,
              current: assignedCount,
            },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Geen toestemming om accounts aan te maken' },
          { status: 403 }
        );
      }

      requesterUserId = currentUser.userId;
    }

    const body = await request.json();
    const parse = provisionSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: parse.error.errors },
        { status: 400 }
      );
    }

    const { email, name, password, companyId, companyName, role, license } = parse.data;

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json(
        { error: 'E-mailadres is al in gebruik' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      let effectiveCompanyId = companyId || null as unknown as string | null;
      if (!effectiveCompanyId && companyName) {
        const company = await tx.company.create({
          data: { name: companyName, country: 'Netherlands' },
          select: { id: true },
        });
        effectiveCompanyId = company.id;
      }

      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          companyId: effectiveCompanyId ?? undefined,
          role,
          assignedById: requesterUserId ?? undefined, // Track who assigned this account
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          companyId: true,
        },
      });

      let createdLicense = null;
      if (license) {
        createdLicense = await tx.license.create({
          data: {
            userId: user.id,
            plan: license.plan,
            status: license.status,
            accountLimit: license.accountLimit ?? null, // Store account limit for SUPERUSER plans
            expiresAt: license.expiresAt ? new Date(license.expiresAt) : null,
          },
          select: { plan: true, status: true, accountLimit: true, expiresAt: true },
        });
      }

      return { user, license: createdLicense };
    });

    return NextResponse.json(
      {
        message: result.license ? 'Gebruiker en licentie aangemaakt' : 'Gebruiker aangemaakt',
        user: result.user,
        license: result.license || null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Provision error:', error);
    console.error('Error stack:', error?.stack);
    
    // Provide helpful error messages
    let errorMessage = 'Interne serverfout';
    if (error?.code === 'P2002') {
      errorMessage = 'E-mailadres is al in gebruik';
    } else if (error?.message?.includes('Unique constraint')) {
      errorMessage = 'E-mailadres is al in gebruik';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    const errorDetails = process.env.NODE_ENV === 'development' 
      ? (error?.message || error?.code || 'Unknown error')
      : undefined;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        message: errorMessage 
      },
      { status: 500 }
    );
  }
}


