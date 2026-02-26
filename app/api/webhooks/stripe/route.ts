import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function onPaymentSuccess(organisationId: string, module: string) {
  await prisma.userModule.upsert({
    where: { organisationId },
    update: { [module]: true },
    create: {
      organisationId,
      [module]: true,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  console.log('🔔 Webhook Stripe reçu');

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 });
  }

  // TODO: Vérifier la signature Stripe
  const event = JSON.parse(body);
  console.log('📦 Event type:', event.type);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const factureId = paymentIntent.metadata?.factureId;
      console.log('💰 Paiement réussi pour facture:', factureId);
      
      if (factureId) {
        await prisma.facture.update({
          where: { id: factureId },
          data: { statut: 'PAYEE' },
        });
        console.log('✅ Facture marquée comme PAYEE');
      }
      break;
    }

    case 'checkout.session.completed': {
      const { orgId, module, type, subscriptionId } = event.data.object.metadata;
      
      if (type === 'ACTE') {
        // Paiement one-shot : activer immédiatement
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            statut: 'ACTIF',
            stripeSubId: event.data.object.id,
          },
        });
        await onPaymentSuccess(orgId, module);
      } else if (type === 'ABONNEMENT') {
        // Abonnement : activer avec date de fin
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: {
            statut: 'ACTIF',
            stripeSubId: event.data.object.subscription,
            fin: new Date(event.data.object.subscription_data?.trial_end || Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });
        await onPaymentSuccess(orgId, module);
      }
      break;
    }

    case 'customer.subscription.updated': {
      // Renouvellement d'abonnement
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubId: event.data.object.id },
      });
      
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            fin: new Date(event.data.object.current_period_end * 1000),
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      // Annulation ou échec de paiement
      const subscription = await prisma.subscription.findFirst({
        where: { stripeSubId: event.data.object.id || event.data.object.subscription },
      });
      
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { statut: 'EXPIRE', fin: new Date() },
        });
        
        // Désactiver le module
        await prisma.userModule.update({
          where: { organisationId: subscription.organisationId },
          data: { [subscription.module]: false },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
