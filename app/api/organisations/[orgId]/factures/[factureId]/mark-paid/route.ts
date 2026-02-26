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

    const updated = await prisma.facture.update({
      where: { id: factureId },
      data: { statut: 'PAYEE' },
      include: { client: { select: { id: true, nom: true, email: true } } },
    });

    return NextResponse.json({ facture: updated });
  } catch (error) {
    console.error('Erreur mark-paid facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
