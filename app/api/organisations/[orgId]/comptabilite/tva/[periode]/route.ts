import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, checkOrgAccess } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; periode: string }> }
) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const { orgId, periode } = await params;
    const member = await checkOrgAccess(auth.userId!, orgId);
    if (!member) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const rapport = await prisma.rapportTVA.findFirst({
      where: {
        organisationId: orgId,
        periode: periode,
      },
    });

    if (!rapport) {
      return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
    }

    return NextResponse.json(rapport);
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur: ${error} ` }, { status: 500 });
  }
}
