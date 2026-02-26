import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createProduitSchema } from '@/lib/validations/produit';

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

    const [produits, total] = await Promise.all([
      prisma.produit.findMany({
        where: { organisationId: orgId },
        skip,
        take: limit,
        orderBy: { nom: 'asc' },
      }),
      prisma.produit.count({ where: { organisationId: orgId } }),
    ]);

    return NextResponse.json({
      produits: produits.map(p => ({
        ...p,
        prixHt: Number(p.prixHt),
        tauxTva: Number(p.tauxTva),
      })),
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
    const validated = createProduitSchema.parse(body);

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

    const produit = await prisma.produit.create({
      data: {
        ...validated,
        organisationId: orgId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'CREATE_PRODUIT',
        module: 'facturation',
        payload: { produitId: produit.id },
      },
    });

    return NextResponse.json({ 
      produit: {
        ...produit,
        prixHt: Number(produit.prixHt),
        tauxTva: Number(produit.tauxTva),
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
