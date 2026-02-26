import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { updateProduitSchema } from '@/lib/validations/produit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; produitId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, produitId } = await params;

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

    const produit = await prisma.produit.findUnique({
      where: { id: produitId, organisationId: orgId },
    });

    if (!produit) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      produit: {
        ...produit,
        prixHt: Number(produit.prixHt),
        tauxTva: Number(produit.tauxTva),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; produitId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, produitId } = await params;
    const body = await req.json();
    const validated = updateProduitSchema.parse(body);

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

    const produit = await prisma.produit.update({
      where: { id: produitId, organisationId: orgId },
      data: validated,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'UPDATE_PRODUIT',
        module: 'facturation',
        payload: { produitId: produit.id, changes: validated },
      },
    });

    return NextResponse.json({
      produit: {
        ...produit,
        prixHt: Number(produit.prixHt),
        tauxTva: Number(produit.tauxTva),
      },
    });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; produitId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, produitId } = await params;

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

    await prisma.produit.delete({
      where: { id: produitId, organisationId: orgId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'DELETE_PRODUIT',
        module: 'facturation',
        payload: { produitId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
