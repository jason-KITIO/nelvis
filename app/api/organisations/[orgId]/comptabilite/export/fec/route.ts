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
    const annee = searchParams.get("annee") || new Date().getFullYear().toString();

    const ecritures = await prisma.ecritureComptable.findMany({
      where: {
        organisationId: orgId,
        dateEcriture: {
          gte: new Date(`${annee}-01-01`),
          lte: new Date(`${annee}-12-31`),
        },
      },
      orderBy: { dateEcriture: "asc" },
    });

    // Format FEC: JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise
    const fecLines = ecritures.map((e, idx) => {
      const dateStr = format(new Date(e.dateEcriture), "yyyyMMdd");
      return [
        e.journal,
        e.journal,
        `${idx + 1}`,
        dateStr,
        e.compteDebit,
        "",
        "",
        "",
        "",
        dateStr,
        "",
        e.montant.toString(),
        "0",
        "",
        "",
        dateStr,
        "",
        "",
      ].join("|");
    });

    const fecContent = [
      "JournalCode|JournalLib|EcritureNum|EcritureDate|CompteNum|CompteLib|CompAuxNum|CompAuxLib|PieceRef|PieceDate|EcritureLib|Debit|Credit|EcritureLet|DateLet|ValidDate|Montantdevise|Idevise",
      ...fecLines,
    ].join("\n");

    return new NextResponse(fecContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="FEC_${annee}.txt"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
