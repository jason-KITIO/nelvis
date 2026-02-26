import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, checkOrgAccess } from '@/lib/middleware';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId, 'ADMIN');
  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { charteGraphique } = await req.json();

  const organisation = await prisma.organisation.update({
    where: { id: orgId },
    data: { charteGraphique },
  });

  return NextResponse.json({ organisation });
}
