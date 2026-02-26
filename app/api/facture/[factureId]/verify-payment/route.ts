import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: NextRequest, { params }: { params: Promise<{ factureId: string }> }) {
  try {
    const { factureId } = await params;
    const { token } = await req.json();

    const facture = await prisma.facture.findFirst({
      where: { id: factureId, tokenAcces: token },
    });

    if (!facture) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    if (facture.statut === 'PAYEE') {
      return NextResponse.json({ statut: 'PAYEE' });
    }

    if (facture.stripePaymentIntent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(facture.stripePaymentIntent);
      
      if (paymentIntent.status === 'succeeded') {
        await prisma.facture.update({
          where: { id: factureId },
          data: { statut: 'PAYEE' },
        });
        return NextResponse.json({ statut: 'PAYEE' });
      }
    }

    return NextResponse.json({ statut: facture.statut });
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
