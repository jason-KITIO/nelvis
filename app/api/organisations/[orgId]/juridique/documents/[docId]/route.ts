import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { orgId: string; docId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { orgId, docId } = params;

  const member = await prisma.orgMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const document = await prisma.documentJuridique.findFirst({
    where: { 
      id: docId,
      dossier: { organisationId: orgId },
    },
  });

  if (!document) {
    return NextResponse.json({ error: 'Document non trouvé' }, { status: 404 });
  }

  // Soft delete avec date de suppression (RGPD 48h)
  const deletionDate = new Date();
  deletionDate.setHours(deletionDate.getHours() + 48);

  await prisma.documentJuridique.update({
    where: { id: docId },
    data: { supprimeLe: deletionDate },
  });

  return NextResponse.json({ 
    success: true,
    message: 'Document marqué pour suppression dans 48h (RGPD)',
    deletionDate,
  });
}
