import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ devisId: string }> }
) {
  try {
    const { devisId } = await params;

    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: { 
        client: { select: { nom: true, email: true, adresse: true, siret: true } },
        organisation: { select: { name: true, adresse: true, siret: true } },
        lignes: true
      },
    });

    if (!devis) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      devis: {
        ...devis,
        montantHt: Number(devis.montantHt),
        tva: Number(devis.tva),
        lignes: devis.lignes?.map(l => ({
          ...l,
          quantite: Number(l.quantite),
          prixUnitaireHt: Number(l.prixUnitaireHt),
          tauxTva: Number(l.tauxTva),
        })) || [],
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}