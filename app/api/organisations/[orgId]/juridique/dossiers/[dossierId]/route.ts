import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string; dossierId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { orgId, dossierId } = params;

  const member = await prisma.organisationMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const dossier = await prisma.dossierJuridique.findUnique({
    where: { id: dossierId, organisationId: orgId },
  });

  if (!dossier) {
    return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 });
  }

  return NextResponse.json(dossier);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orgId: string; dossierId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { orgId, dossierId } = params;
  const body = await req.json();

  const member = await prisma.organisationMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const dossier = await prisma.dossierJuridique.update({
    where: { id: dossierId, organisationId: orgId },
    data: {
      ...(body.titre && { titre: body.titre }),
      ...(body.status && { status: body.status }),
      ...(body.questionnaire && { questionnaire: body.questionnaire }),
    },
  });

  return NextResponse.json(dossier);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { orgId: string; dossierId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { orgId, dossierId } = params;

  const member = await prisma.organisationMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  await prisma.dossierJuridique.delete({
    where: { id: dossierId, organisationId: orgId },
  });

  return NextResponse.json({ success: true }, { status: 200 });
}
