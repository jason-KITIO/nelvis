import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string; dossierId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { orgId, dossierId } = params;

  const member = await prisma.orgMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const documents = await prisma.documentJuridique.findMany({
    where: {
      dossierId,
      dossier: { organisationId: orgId },
      supprimeLe: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}
