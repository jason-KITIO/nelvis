import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createClientSchema } from '@/lib/validations/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const member = await prisma.orgMember.findUnique({
      where: {
        userId_organisationId: {
          userId: session.userId,
          organisationId: orgId,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where: { organisationId: orgId },
        skip,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      prisma.client.count({ where: { organisationId: orgId } }),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId } = await params;
    const body = await req.json();
    const validated = createClientSchema.parse(body);

    const member = await prisma.orgMember.findUnique({
      where: {
        userId_organisationId: {
          userId: session.userId,
          organisationId: orgId,
        },
      },
    });

    if (!member || member.role === 'MEMBER') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Vérifier si l'email existe déjà
    const existingClient = await prisma.client.findUnique({
      where: { email: validated.email },
    });

    if (existingClient) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        ...validated,
        organisationId: orgId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'CREATE_CLIENT',
        module: 'facturation',
        payload: { clientId: client.id },
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
