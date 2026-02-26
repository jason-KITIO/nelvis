import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

  const dossier = await prisma.dossierJuridique.findUnique({
    where: { id: dossierId, organisationId: orgId },
  });

  if (!dossier) {
    return NextResponse.json({ error: "Dossier non trouvé" }, { status: 404 });
  }

  // TODO: Intégrer l'IA pour générer l'annonce légale
  const contenuAnnonce = `ANNONCE LÉGALE GÉNÉRÉE PAR IA\n\nForme juridique: ${dossier.formeJuridique}\nQuestionnaire: ${JSON.stringify(dossier.questionnaire)}`;

  const document = await prisma.documentJuridique.create({
    data: {
      dossierId,
      type: "ANNONCE",
      contenu: contenuAnnonce,
      fichierUrl: `/documents/${dossierId}/annonce-legale.pdf`,
    },
  });

  return NextResponse.json(document);
}
