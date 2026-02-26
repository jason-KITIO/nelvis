import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createDevisSchema } from '@/lib/validations/devis';

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
    const statut = searchParams.get('statut');
    const clientId = searchParams.get('clientId');

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

    const where: Record<string, unknown> = { organisationId: orgId };
    if (statut) where.statut = statut;
    if (clientId) where.clientId = clientId;

    const devis = await prisma.devis.findMany({
      where,
      include: {
        client: { select: { id: true, nom: true, email: true } },
        lignes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      devis: devis.map(d => ({
        ...d,
        montantHt: Number(d.montantHt),
        tva: Number(d.tva),
        lignes: d.lignes.map(l => ({
          ...l,
          quantite: Number(l.quantite),
          prixUnitaireHt: Number(l.prixUnitaireHt),
          tauxTva: Number(l.tauxTva),
        })),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur: ${error} ` }, { status: 500 });
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
    const validated = createDevisSchema.parse(body);

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

    const lastDevis = await prisma.devis.findFirst({
      where: { organisationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    const numero = `DEV-${new Date().getFullYear()}-${String((lastDevis ? parseInt(lastDevis.numero.split('-')[2]) : 0) + 1).padStart(4, '0')}`;

    let montantHt = 0;
    let tva = 0;

    validated.lignes.forEach(ligne => {
      const totalLigneHt = ligne.quantite * ligne.prixUnitaireHt;
      montantHt += totalLigneHt;
      tva += totalLigneHt * (ligne.tauxTva / 100);
    });

    const devis = await prisma.devis.create({
      data: {
        organisationId: orgId,
        clientId: validated.clientId,
        numero,
        statut: 'DRAFT',
        montantHt,
        tva,
        dateExpiration: new Date(validated.dateExpiration),
        tokenExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        lignes: {
          create: validated.lignes.map(ligne => ({
            produitId: ligne.produitId,
            description: ligne.description,
            quantite: ligne.quantite,
            prixUnitaireHt: ligne.prixUnitaireHt,
            tauxTva: ligne.tauxTva,
          })),
        },
      },
      include: {
        client: { select: { id: true, nom: true, email: true } },
        lignes: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'CREATE_DEVIS',
        module: 'facturation',
        payload: { devisId: devis.id },
      },
    });

    return NextResponse.json({
      devis: {
        ...devis,
        montantHt: Number(devis.montantHt),
        tva: Number(devis.tva),
        lignes: devis.lignes.map(l => ({
          ...l,
          quantite: Number(l.quantite),
          prixUnitaireHt: Number(l.prixUnitaireHt),
          tauxTva: Number(l.tauxTva),
        })),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
