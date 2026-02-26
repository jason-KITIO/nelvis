import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ devisId: string }> }
) {
  try {
    const { devisId } = await params;
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 });
    }

    const devis = await prisma.devis.findUnique({
      where: { id: devisId },
      include: { client: true, organisation: true },
    });

    if (!devis) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    if (devis.tokenAcces !== token) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 });
    }

    if (devis.tokenExpiresAt && new Date() > devis.tokenExpiresAt) {
      return NextResponse.json({ error: 'Token expiré' }, { status: 403 });
    }

    if (devis.statut !== 'ENVOYE') {
      return NextResponse.json({ error: 'Devis déjà traité' }, { status: 400 });
    }

    await prisma.devis.update({
      where: { id: devisId },
      data: { statut: 'ACCEPTE' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}