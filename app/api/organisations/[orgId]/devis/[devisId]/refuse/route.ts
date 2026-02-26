import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; devisId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, devisId } = await params;

    const member = await prisma.orgMember.findUnique({
      where: {
        userId_organisationId: {
          userId: session.userId,
          organisationId: orgId,
        },
      },
    });

    if (!member || member.role === 'MEMBER') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const devis = await prisma.devis.update({
      where: { id: devisId, organisationId: orgId },
      data: { statut: 'REFUSE' },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'REFUSE_DEVIS',
        module: 'facturation',
        payload: { devisId },
      },
    });

    return NextResponse.json({ devis });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
