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

  const organisation = await prisma.organisation.findUnique({
    where: { id: orgId },
    include: { modules: true },
  });

  return NextResponse.json({ organisation });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId, 'ADMIN');
  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { name, siret, siren, formeJuridique, pays, adresse, logoUrl } = await req.json();

  const organisation = await prisma.organisation.update({
    where: { id: orgId },
    data: { name, siret, siren, formeJuridique, pays, adresse, logoUrl },
  });

  return NextResponse.json({ organisation });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId, 'OWNER');
  if (!member) {
    return NextResponse.json({ error: 'Seul le propriétaire peut supprimer' }, { status: 403 });
  }

  await prisma.$transaction([
    prisma.dossierJuridique.deleteMany({ where: { organisationId: orgId } }),
    prisma.auditLog.deleteMany({ where: { organisationId: orgId } }),
    prisma.subscription.deleteMany({ where: { organisationId: orgId } }),
    prisma.orgMember.deleteMany({ where: { organisationId: orgId } }),
    prisma.userModule.deleteMany({ where: { organisationId: orgId } }),
    prisma.organisation.delete({ where: { id: orgId } }),
  ]);

  return NextResponse.json({ message: 'Organisation supprimée' });
}
