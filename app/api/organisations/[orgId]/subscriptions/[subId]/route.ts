import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string; subId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { orgId, subId } = params;

  const member = await prisma.orgMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subId, organisationId: orgId },
  });

  if (!subscription) {
    return NextResponse.json({ error: 'Abonnement non trouvé' }, { status: 404 });
  }

  return NextResponse.json(subscription);
}
