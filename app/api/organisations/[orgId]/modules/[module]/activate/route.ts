import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, checkOrgAccess } from '@/lib/middleware';

const VALID_MODULES = ['juridique', 'facturation', 'comptabilite', 'rhPaie', 'vocal', 'logistique'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; module: string }> }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId, module } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId, 'ADMIN');
  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  if (!VALID_MODULES.includes(module)) {
    return NextResponse.json({ error: 'Module invalide' }, { status: 400 });
  }

  const modules = await prisma.userModule.update({
    where: { organisationId: orgId },
    data: { [module]: true },
  });

  return NextResponse.json({ modules });
}
