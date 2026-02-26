import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest, verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;

  if (!payload?.userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { orgId } = params;
  const body = await req.json();

  const member = await prisma.orgMember.findFirst({
    where: {
      organisationId: orgId,
      userId: payload.userId as string,
      role: { in: ["OWNER", "ADMIN"] },
    },
  });

  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Créer la subscription en attente
  const subscription = await prisma.subscription.create({
    data: {
      organisationId: orgId,
      module: body.module,
      type: body.type,
      montant: body.montant,
      statut: "EXPIRE",
      debut: new Date(),
    },
  });

  // Créer session Stripe
  if (body.provider === "STRIPE") {
    // TODO: Installer stripe avec: npm install stripe
    // const Stripe = require('stripe');
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const session = await stripe.checkout.sessions.create({...});
    
    return NextResponse.json(
      { 
        subscriptionId: subscription.id, 
        checkoutUrl: `https://checkout.stripe.com/pay/${subscription.id}`,
        message: "Installer 'npm install stripe' pour activer les paiements"
      },
      { status: 201 },
    );
  }

  // PayPal
  if (body.provider === "PAYPAL") {
    // TODO: Installer @paypal/checkout-server-sdk avec: npm install @paypal/checkout-server-sdk
    
    return NextResponse.json(
      { 
        subscriptionId: subscription.id, 
        checkoutUrl: `https://www.paypal.com/checkoutnow?token=${subscription.id}`,
        message: "Installer 'npm install @paypal/checkout-server-sdk' pour activer les paiements"
      },
      { status: 201 },
    );
  }

  return NextResponse.json({ error: "Provider non supporté" }, { status: 400 });
}
