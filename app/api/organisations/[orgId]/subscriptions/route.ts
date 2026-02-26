import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  
  if (!payload?.userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { orgId } = await params;

  const member = await prisma.orgMember.findFirst({
    where: { organisationId: orgId, userId: payload.userId as string },
  });

  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { organisationId: orgId },
    orderBy: { debut: 'desc' },
  });

  return NextResponse.json(subscriptions);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const token = getTokenFromRequest(req);
  const payload = token ? await verifyToken(token) : null;
  
  if (!payload?.userId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { orgId } = await params;
  const { module, type, montant, provider } = await req.json();

  const member = await prisma.orgMember.findFirst({
    where: { organisationId: orgId, userId: payload.userId as string, role: { in: ['OWNER', 'ADMIN'] } },
  });

  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  // Créer la subscription en attente
  const subscription = await prisma.subscription.create({
    data: {
      organisationId: orgId,
      module,
      type,
      montant,
      statut: 'EXPIRE', // En attente du paiement
      debut: new Date(),
    },
  });

  // TODO: Créer session Stripe/PayPal selon provider et type
  const checkoutUrl = `https://checkout.${provider.toLowerCase()}.com/session_${subscription.id}`;

  return NextResponse.json({ subscriptionId: subscription.id, checkoutUrl }, { status: 201 });
}
