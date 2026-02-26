import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { orgId, factureId } = await params;

    const facture = await prisma.facture.findFirst({
      where: { id: factureId, organisationId: orgId },
      include: { client: true, lignes: true },
    });

    if (!facture) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    if (facture.statut === 'PAYEE') return NextResponse.json({ error: 'Facture déjà payée' }, { status: 400 });

    const montantTotal = Number(facture.montantHt) + Number(facture.tvaMontant);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montantTotal * 100),
      currency: 'eur',
      metadata: {
        factureId: facture.id,
        organisationId: orgId,
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
    console.error('Erreur payment-link facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
