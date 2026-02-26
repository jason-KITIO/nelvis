import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate, checkOrgAccess } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; noteId: string }> }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId, noteId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId);
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const noteDeFrais = await prisma.noteDeFrais.findFirst({
    where: { id: noteId, organisationId: orgId },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });

  if (!noteDeFrais) {
    return NextResponse.json({ error: "Note de frais introuvable" }, { status: 404 });
  }

  return NextResponse.json({ noteDeFrais });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; noteId: string }> }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId, noteId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId);
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { montantOcr, dateOcr, categorieOcr, statut } = await req.json();

  const noteDeFrais = await prisma.noteDeFrais.update({
    where: { id: noteId },
    data: {
      montantOcr,
      dateOcr: dateOcr ? new Date(dateOcr) : undefined,
      categorieOcr,
      statut,
    },
  });

  return NextResponse.json({ noteDeFrais });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; noteId: string }> }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId, noteId } = await params;
  const member = await checkOrgAccess(auth.userId!, orgId, "ADMIN");
  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.noteDeFrais.delete({
    where: { id: noteId },
  });

  return NextResponse.json({ message: "Note de frais supprimée" });
}
