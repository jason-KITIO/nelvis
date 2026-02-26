import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const body = await req.json();
  const webhookId = req.headers.get("paypal-transmission-id");

  if (!webhookId) {
    return NextResponse.json({ error: "Webhook ID manquant" }, { status: 400 });
  }

  // TODO: Vérifier la signature PayPal

  switch (body.event_type) {
    case "PAYMENT.SALE.COMPLETED": {
      // Paiement ACTE
      const { orgId, module, subscriptionId } = body.resource.custom;

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          statut: "ACTIF",
          paypalSubId: body.resource.id,
        },
      });
      await onPaymentSuccess(orgId, module);
      break;
    }

    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      // Abonnement activé
      const { orgId, module, subscriptionId } = body.resource.custom_id;

      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          statut: "ACTIF",
          paypalSubId: body.resource.id,
          fin: new Date(body.resource.billing_info.next_billing_time),
        },
      });
      await onPaymentSuccess(orgId, module);
      break;
    }

    case "BILLING.SUBSCRIPTION.UPDATED": {
      // Renouvellement
      const subscription = await prisma.subscription.findFirst({
        where: { paypalSubId: body.resource.id },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            fin: new Date(body.resource.billing_info.next_billing_time),
          },
        });
      }
      break;
    }

    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.SUSPENDED": {
      const subscription = await prisma.subscription.findFirst({
        where: { paypalSubId: body.resource.id },
      });

      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { statut: "EXPIRE", fin: new Date() },
        });

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
