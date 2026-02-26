import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { orgId: string; logId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { orgId, logId } = params;

  const member = await prisma.organisationMember.findFirst({
    where: { organisationId: orgId, userId: session.user.id },
  });

  if (!member) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const log = await prisma.auditLog.findUnique({
    where: { id: logId, organisationId: orgId },
  });

  if (!log) {
    return NextResponse.json({ error: "Log non trouvé" }, { status: 404 });
  }

  return NextResponse.json(log);
}
