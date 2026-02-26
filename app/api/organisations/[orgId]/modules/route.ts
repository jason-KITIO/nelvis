import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, checkOrgAccess } from '@/lib/middleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId);
  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const modules = await prisma.userModule.findUnique({
    where: { organisationId: orgId },
  });

  return NextResponse.json({ modules });
}
