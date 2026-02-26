import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest, { params }: { params: Promise<{ factureId: string }> }) {
  try {
    const { factureId } = await params;
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const facture = await prisma.facture.findFirst({
      where: { 
        id: factureId,
        tokenAcces: token,
      },
      include: { client: true, organisation: true },
    });

    if (!facture || !facture.tokenAcces) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    if (facture.tokenExpiresAt && new Date() > facture.tokenExpiresAt) {
      return NextResponse.json({ error: 'Lien expiré' }, { status: 403 });
    }

    if (facture.statut === 'PAYEE') {
      return NextResponse.json({ error: 'Facture déjà payée' }, { status: 400 });
    }

    const montantTotal = Number(facture.montantHt) + Number(facture.tvaMontant);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montantTotal * 100),
      currency: 'eur',
      metadata: {
        factureId: facture.id,
        organisationId: facture.organisationId,
        numero: facture.numero,
      },
      description: `Facture ${facture.numero} - ${facture.client.nom}`,
    });

    await prisma.facture.update({
      where: { id: factureId },
      data: { stripePaymentIntent: paymentIntent.id },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Erreur création payment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
