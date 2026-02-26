import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, checkOrgAccess } from '@/lib/middleware';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId, userId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId, 'ADMIN');
  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { role } = await req.json();

  if (!role) {
    return NextResponse.json({ error: 'Rôle requis' }, { status: 400 });
  }

  const updatedMember = await prisma.orgMember.update({
    where: { userId_organisationId: { userId, organisationId: orgId } },
    data: { role },
  });

  return NextResponse.json({ member: updatedMember });
}
