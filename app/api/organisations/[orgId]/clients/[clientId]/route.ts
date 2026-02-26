import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { updateClientSchema } from '@/lib/validations/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; clientId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, clientId } = await params;

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

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organisationId: orgId,
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    }

    return NextResponse.json({ client });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; clientId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, clientId } = await params;
    const body = await req.json();
    const validated = updateClientSchema.parse(body);

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

    // Vérifier si l'email existe déjà (sauf pour le client actuel)
    if (validated.email) {
      const existingClient = await prisma.client.findUnique({
        where: { email: validated.email },
      });

      if (existingClient && existingClient.id !== clientId) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
      }
    }

    const client = await prisma.client.updateMany({
      where: {
        id: clientId,
        organisationId: orgId,
      },
      data: validated,
    });

    if (client.count === 0) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    }

    const updatedClient = await prisma.client.findUnique({
      where: { id: clientId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'UPDATE_CLIENT',
        module: 'facturation',
        payload: { clientId, changes: validated },
      },
    });

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; clientId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, clientId } = await params;

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

    const deleted = await prisma.client.deleteMany({
      where: {
        id: clientId,
        organisationId: orgId,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 });
    }

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'DELETE_CLIENT',
        module: 'facturation',
        payload: { clientId },
      },
    });

    return NextResponse.json({ message: 'Client supprimé' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
