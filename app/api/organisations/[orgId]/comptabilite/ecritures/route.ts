import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, checkOrgAccess } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const { orgId } = await params;
    const member = await checkOrgAccess(auth.userId!, orgId);
    if (!member) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const journal = searchParams.get("journal");
    const dateDebut = searchParams.get("dateDebut");
    const dateFin = searchParams.get("dateFin");

    const where: any = { organisationId: orgId };
    if (journal) where.journal = journal;
    if (dateDebut || dateFin) {
      where.dateEcriture = {};
      if (dateDebut) where.dateEcriture.gte = new Date(dateDebut);
      if (dateFin) where.dateEcriture.lte = new Date(dateFin);
    }

    const ecritures = await prisma.ecritureComptable.findMany({
      where,
      orderBy: { dateEcriture: "desc" },
    });

    return NextResponse.json(ecritures);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const { orgId } = await params;
    const member = await checkOrgAccess(auth.userId!, orgId);
    if (!member) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { journal, compteDebit, compteCredit, montant, dateEcriture } = body;

    const ecriture = await prisma.ecritureComptable.create({
      data: {
        organisationId: orgId,
        journal,
        compteDebit,
        compteCredit,
        montant,
        dateEcriture: new Date(dateEcriture),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.userId!,
        organisationId: orgId,
        action: "CREATE_ECRITURE",
        module: "COMPTABILITE",
        payload: { ecritureId: ecriture.id },
      },
    });

    return NextResponse.json(ecriture, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
