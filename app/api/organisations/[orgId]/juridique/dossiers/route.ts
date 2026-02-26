import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { orgId } = params;

  const member = await prisma.orgMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const dossiers = await prisma.dossierJuridique.findMany({
    where: { organisationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(dossiers);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { orgId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { orgId } = params;
  const body = await req.json();

  const member = await prisma.orgMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const dossier = await prisma.dossierJuridique.create({
    data: {
      organisationId: orgId,
      statut: "DRAFT",
      formeJuridique: body.formeJuridique || "SARL",
      questionnaire: body.questionnaire,
    },
  });

  return NextResponse.json(dossier, { status: 201 });
}
