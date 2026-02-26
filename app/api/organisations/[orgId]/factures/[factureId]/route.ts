import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { updateFactureSchema } from '@/lib/validations/facture';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { orgId, factureId } = await params;

    const facture = await prisma.facture.findFirst({
      where: { id: factureId, organisationId: orgId },
      include: { 
        client: { select: { id: true, nom: true, email: true } },
        lignes: true,
      },
    });

    if (!facture) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });

    return NextResponse.json({ facture });
  } catch (error) {
    console.error('Erreur GET facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { orgId, factureId } = await params;
    const body = await req.json();
    const validated = updateFactureSchema.parse(body);

    const existing = await prisma.facture.findFirst({
      where: { id: factureId, organisationId: orgId },
    });

    if (!existing) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });

    const updateData: any = {};
    if (validated.clientId) updateData.clientId = validated.clientId;
    if (validated.dateEcheance) updateData.dateEcheance = new Date(validated.dateEcheance);

    if (validated.lignes) {
      updateData.montantHt = validated.lignes.reduce(
        (sum, ligne) => sum + ligne.quantite * ligne.prixUnitaireHt,
        0
      );
      updateData.tvaMontant = validated.lignes.reduce(
        (sum, ligne) => sum + (ligne.quantite * ligne.prixUnitaireHt * ligne.tauxTva) / 100,
        0
      );
    }

    const facture = await prisma.facture.update({
      where: { id: factureId },
      data: updateData,
      include: { client: { select: { id: true, nom: true, email: true } } },
    });

    return NextResponse.json({ facture });
  } catch (error) {
    console.error('Erreur PATCH facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { orgId, factureId } = await params;

    const facture = await prisma.facture.findFirst({
      where: { id: factureId, organisationId: orgId },
    });

    if (!facture) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    if (facture.statut !== 'EMISE') {
      return NextResponse.json({ error: 'Seules les factures émises peuvent être supprimées' }, { status: 400 });
    }

    await prisma.facture.delete({ where: { id: factureId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
