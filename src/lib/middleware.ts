import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function authenticate(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    return { error: NextResponse.json({ error: 'Token invalide' }, { status: 401 }) };
  }

  return { userId: payload.userId as string };
}

export async function checkOrgAccess(userId: string, orgId: string, minRole?: 'MEMBER' | 'ADMIN' | 'OWNER') {
  const member = await prisma.orgMember.findUnique({
    where: { userId_organisationId: { userId, organisationId: orgId } },
  });

  if (!member) return null;

  if (minRole === 'OWNER' && member.role !== 'OWNER') return null;
  if (minRole === 'ADMIN' && member.role === 'MEMBER') return null;

  return member;
}
