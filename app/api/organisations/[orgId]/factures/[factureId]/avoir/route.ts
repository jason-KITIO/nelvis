import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { orgId, factureId } = await params;

    const facture = await prisma.facture.findFirst({
      where: { id: factureId, organisationId: orgId },
    });

    if (!facture) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });

    const lastAvoir = await prisma.facture.findFirst({
      where: { organisationId: orgId, statut: 'AVOIR' },
      orderBy: { createdAt: 'desc' },
    });

    const numero = lastAvoir
      ? `A${(parseInt(lastAvoir.numero.slice(1)) + 1).toString().padStart(6, '0')}`
      : 'A000001';

    const avoir = await prisma.facture.create({
      data: {
        organisationId: orgId,
        clientId: facture.clientId,
        numero,
        statut: 'AVOIR',
        montantHt: -facture.montantHt,
        tvaMontant: -facture.tvaMontant,
        dateEcheance: new Date(),
      },
      include: { client: { select: { id: true, nom: true, email: true } } },
    });

    return NextResponse.json({ avoir });
  } catch (error) {
    console.error('Erreur avoir facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
