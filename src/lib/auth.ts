import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  impersonatedBy?: string; // Admin user ID who is impersonating this user
  isImpersonating?: boolean; // Flag to indicate if this is an impersonated session
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(handler: (req: NextRequest, user: JWTPayload) => Promise<Response>) {
  return async (req: NextRequest) => {
    const user = getUserFromRequest(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return handler(req, user);
  };
}

export function requireRole(allowedRoles: string[]) {
  return (handler: (req: NextRequest, user: JWTPayload) => Promise<Response>) => {
    return async (req: NextRequest) => {
      const user = getUserFromRequest(req);
      if (!user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (!allowedRoles.includes(user.role)) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return handler(req, user);
    };
  };
}

export function hasPermission(user: JWTPayload, action: string, resource?: string): boolean {
  // Admin has all permissions
  if (user.role === 'ADMIN') return true;
  
  // Manager permissions
  if (user.role === 'MANAGER') {
    const managerPermissions = [
      'read:assessments',
      'create:assessments',
      'update:assessments',
      'delete:assessments',
      'read:risks',
      'create:risks',
      'update:risks',
      'delete:risks',
      'read:actions',
      'create:actions',
      'update:actions',
      'assign:actions',
      'read:reports',
      'generate:reports'
    ];
    return managerPermissions.includes(action);
  }
  
  // Employee permissions
  if (user.role === 'EMPLOYEE') {
    const employeePermissions = [
      'read:assessments',
      'read:risks',
      'read:actions',
      'update:actions', // Only their own
      'comment:risks',
      'report:incidents'
    ];
    return employeePermissions.includes(action);
  }
  
  // External advisor permissions
  if (user.role === 'EXTERNAL_ADVISOR') {
    const advisorPermissions = [
      'read:assessments',
      'read:risks',
      'read:actions',
      'comment:risks',
      'advise:risks',
      'read:reports'
    ];
    return advisorPermissions.includes(action);
  }
  
  return false;
}
