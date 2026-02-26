import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, checkOrgAccess } from '@/lib/middleware';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId, 'ADMIN');
  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const { email, role } = await req.json();

  if (!email || !role) {
    return NextResponse.json({ error: 'Email et rôle requis' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
  }

  const existingMember = await prisma.orgMember.findUnique({
    where: { userId_organisationId: { userId: user.id, organisationId: orgId } },
  });

  if (existingMember) {
    return NextResponse.json({ error: 'Utilisateur déjà membre' }, { status: 409 });
  }

  const newMember = await prisma.orgMember.create({
    data: {
      userId: user.id,
      organisationId: orgId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  return NextResponse.json({ member: newMember }, { status: 201 });
}
