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

    const rapports = await prisma.rapportTVA.findMany({
      where: { organisationId: orgId },
      orderBy: { periode: "desc" },
    });

    return NextResponse.json(rapports);
  } catch (error) {
    return NextResponse.json({ error: `Erreur serveur: ${error} ` }, { status: 500 });
  }
}
