import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, checkOrgAccess } from '@/lib/middleware';

export async function DELETE(
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

  await prisma.orgMember.delete({
    where: { userId_organisationId: { userId, organisationId: orgId } },
  });

  return NextResponse.json({ message: 'Membre retiré' });
}
