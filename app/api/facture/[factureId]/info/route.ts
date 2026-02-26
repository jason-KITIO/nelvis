import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ factureId: string }> }) {
  try {
    const { factureId } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const facture = await prisma.facture.findFirst({
      where: { 
        id: factureId,
        tokenAcces: token,
      },
      include: {
        client: true,
        organisation: true,
        lignes: true,
      },
    });

    if (!facture || !facture.tokenAcces) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Vérifier si le token a expiré
    if (facture.tokenExpiresAt && new Date() > facture.tokenExpiresAt) {
      return NextResponse.json({ error: 'Lien expiré' }, { status: 403 });
    }

    return NextResponse.json({ facture });
  } catch (error) {
    console.error('Erreur récupération facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
