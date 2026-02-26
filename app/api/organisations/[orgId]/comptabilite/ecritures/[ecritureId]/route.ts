import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, checkOrgAccess } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; ecritureId: string }> }
) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const { orgId, ecritureId } = await params;
    const member = await checkOrgAccess(auth.userId!, orgId);
    if (!member) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const ecriture = await prisma.ecritureComptable.findFirst({
      where: {
        id: ecritureId,
        organisationId: orgId,
      },
    });

    if (!ecriture) {
      return NextResponse.json({ error: "Écriture non trouvée" }, { status: 404 });
    }

    return NextResponse.json(ecriture);
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur : ${error} ` }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; ecritureId: string }> }
) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const { orgId, ecritureId } = await params;
    const member = await checkOrgAccess(auth.userId!, orgId);
    if (!member) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    const { journal, compteDebit, compteCredit, montant, dateEcriture } = body;

    const ecriture = await prisma.ecritureComptable.update({
      where: { id: ecritureId },
      data: {
        ...(journal && { journal }),
        ...(compteDebit && { compteDebit }),
        ...(compteCredit && { compteCredit }),
        ...(montant && { montant }),
        ...(dateEcriture && { dateEcriture: new Date(dateEcriture) }),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: auth.userId!,
        organisationId: orgId,
        action: "UPDATE_ECRITURE",
        module: "COMPTABILITE",
        payload: { ecritureId: ecriture.id, changes: body },
      },
    });

    return NextResponse.json(ecriture);
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur : ${error} ` }, { status: 500 });
  }
}
