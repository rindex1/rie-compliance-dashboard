import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isProvisionAuthorized } from '@/lib/admin-auth';
import { generateToken, getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const impersonateSchema = z.object({
  userId: z.string().min(1, 'Gebruiker ID is verplicht'),
});

/**
 * Impersonate a user
 * This endpoint allows:
 * 1. Admins using the provision token (admin tool)
 * 2. Users with "admin" plan license
 */
export async function POST(request: NextRequest) {
  try {
    if (!prisma || !process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database niet geconfigureerd' },
        { status: 503 }
      );
    }

    // Check authorization: either provision token OR user with admin plan
    const hasProvisionToken = isProvisionAuthorized(request);
    let hasAdminPlan = false;

    if (!hasProvisionToken) {
      // Check if logged-in user has admin plan license
      const currentUser = getUserFromRequest(request);
      if (currentUser) {
        const license = await prisma.license.findUnique({
          where: { userId: currentUser.userId },
          select: { plan: true, status: true, expiresAt: true },
        });

        hasAdminPlan = 
          license?.plan === 'ADMIN' && 
          license?.status === 'ACTIVE' &&
          (!license.expiresAt || new Date(license.expiresAt) > new Date());
      }

      if (!hasAdminPlan) {
        return NextResponse.json(
          { error: 'Niet geautoriseerd. Alleen beheerders met admin licentie kunnen gebruikers impersoneren.' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validation = impersonateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ongeldige gegevens', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { userId } = validation.data;

    // Find the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        password: false,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    // Generate JWT token for the target user
    // The token represents the target user, but we can track it's impersonated
    // Note: For now, we'll generate a normal token. The impersonation tracking
    // can be added to the token payload if needed for audit purposes.
    const token = generateToken({
      userId: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      companyId: targetUser.companyId || undefined,
      isImpersonating: true, // Flag to indicate this is an impersonated session
    });

    return NextResponse.json({
      message: `Ingelogd als ${targetUser.name}`,
      user: targetUser,
      token,
      isImpersonating: true,
    });
  } catch (error: any) {
    console.error('Impersonate error:', error);
    return NextResponse.json(
      { error: 'Interne serverfout', details: error?.message },
      { status: 500 }
    );
  }
}

