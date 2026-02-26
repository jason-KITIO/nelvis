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

    const devis = await prisma.devis.findUnique({
      where: { id: devisId, organisationId: orgId },
      include: { lignes: true },
    });

    if (!devis) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    if (devis.statut !== 'ACCEPTE') {
      return NextResponse.json({ error: 'Le devis doit être accepté' }, { status: 400 });
    }

    const lastFacture = await prisma.facture.findFirst({
      where: { organisationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    const numero = `FAC-${new Date().getFullYear()}-${String((lastFacture ? parseInt(lastFacture.numero.split('-')[2]) : 0) + 1).padStart(4, '0')}`;

    const facture = await prisma.facture.create({
      data: {
        organisationId: orgId,
        clientId: devis.clientId,
        devisId: devis.id,
        numero,
        statut: 'EMISE',
        montantHt: devis.montantHt,
        tvaMontant: devis.tva,
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lignes: {
          create: devis.lignes.map(ligne => ({
            produitId: ligne.produitId,
            description: ligne.description,
            quantite: ligne.quantite,
            prixUnitaireHt: ligne.prixUnitaireHt,
            tauxTva: ligne.tauxTva,
          })),
        },
      },
      include: { lignes: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'CONVERT_DEVIS_TO_FACTURE',
        module: 'facturation',
        payload: { devisId, factureId: facture.id },
      },
    });

    return NextResponse.json({ facture });
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur: ${error} ` }, { status: 500 });
  }
}
