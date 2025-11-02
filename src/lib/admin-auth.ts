import { NextRequest } from 'next/server';

export function getExpectedProvisionToken(): string | null {
  const envToken = process.env.PROVISION_TOKEN;
  if (envToken && envToken.length > 0) return envToken;
  // Fallback token in non-production for local development convenience
  if (process.env.NODE_ENV !== 'production') return 'dev-provision-token';
  return null;
}

export function isProvisionAuthorized(request: NextRequest): boolean {
  const headerToken = request.headers.get('x-provision-token');
  const expected = getExpectedProvisionToken();
  return !!expected && headerToken === expected;
}


