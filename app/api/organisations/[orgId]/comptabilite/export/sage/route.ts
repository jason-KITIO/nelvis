import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, checkOrgAccess } from "@/lib/middleware";
import { format } from "date-fns";

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
    const dateDebut = searchParams.get("dateDebut");
    const dateFin = searchParams.get("dateFin");

    const where: any = { organisationId: orgId };
    if (dateDebut || dateFin) {
      where.dateEcriture = {};
      if (dateDebut) where.dateEcriture.gte = new Date(dateDebut);
      if (dateFin) where.dateEcriture.lte = new Date(dateFin);
    }

    const ecritures = await prisma.ecritureComptable.findMany({
      where,
      orderBy: { dateEcriture: "asc" },
    });

    // Format SAGE: Journal;Date;CompteGeneral;Libelle;Debit;Credit
    const sageLines = ecritures.map((e) => {
      const dateStr = format(new Date(e.dateEcriture), "dd/MM/yyyy");
      return [
        e.journal,
        dateStr,
        e.compteDebit,
        "",
        e.montant.toString(),
        "0",
      ].join(";");
    });

    const sageContent = [
      "Journal;Date;CompteGeneral;Libelle;Debit;Credit",
      ...sageLines,
    ].join("\n");

    return new NextResponse(sageContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="export_sage.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
