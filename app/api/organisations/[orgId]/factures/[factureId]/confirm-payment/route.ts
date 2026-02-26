import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const { orgId, factureId } = await params;
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId requis' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Paiement non confirmé' }, { status: 400 });
    }

    const facture = await prisma.facture.update({
      where: { id: factureId, organisationId: orgId },
      data: { statut: 'PAYEE' },
    });

    return NextResponse.json({ success: true, facture });
  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
