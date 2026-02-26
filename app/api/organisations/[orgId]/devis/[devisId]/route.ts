import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { updateDevisSchema } from '@/lib/validations/devis';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; devisId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, devisId } = await params;

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

    const devis = await prisma.devis.findUnique({
      where: { id: devisId, organisationId: orgId },
      include: {
        client: { select: { id: true, nom: true, email: true } },
        lignes: true,
      },
    });

    if (!devis) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

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
    });
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur: ${error} ` }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; devisId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, devisId } = await params;
    const body = await req.json();
    const validated = updateDevisSchema.parse(body);

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

    const updateData: Record<string, unknown> = {};
    if (validated.clientId) updateData.clientId = validated.clientId;
    if (validated.dateExpiration) updateData.dateExpiration = new Date(validated.dateExpiration);

    if (validated.lignes) {
      await prisma.ligneDevis.deleteMany({
        where: { devisId },
      });

      let montantHt = 0;
      let tva = 0;

      validated.lignes.forEach(ligne => {
        const totalLigneHt = ligne.quantite * ligne.prixUnitaireHt;
        montantHt += totalLigneHt;
        tva += totalLigneHt * (ligne.tauxTva / 100);
      });

      updateData.montantHt = montantHt;
      updateData.tva = tva;
      updateData.lignes = {
        create: validated.lignes.map(ligne => ({
          produitId: ligne.produitId,
          description: ligne.description,
          quantite: ligne.quantite,
          prixUnitaireHt: ligne.prixUnitaireHt,
          tauxTva: ligne.tauxTva,
        })),
      };
    }

    const devis = await prisma.devis.update({
      where: { id: devisId, organisationId: orgId },
      data: updateData,
      include: {
        client: { select: { id: true, nom: true, email: true } },
        lignes: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'UPDATE_DEVIS',
        module: 'facturation',
        payload: { devisId, changes: validated },
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
  { params }: { params: Promise<{ orgId: string; devisId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, devisId } = await params;

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

    const existingDevis = await prisma.devis.findUnique({
      where: { id: devisId, organisationId: orgId },
    });

    if (!existingDevis) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    await prisma.devis.delete({
      where: { id: devisId, organisationId: orgId },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'DELETE_DEVIS',
        module: 'facturation',
        payload: { devisId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur: ${error} ` }, { status: 500 });
  }
}
