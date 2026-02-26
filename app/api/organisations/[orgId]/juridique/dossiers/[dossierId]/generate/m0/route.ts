import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, checkOrgAccess } from '@/lib/middleware';

export async function POST(
  req: NextRequest,
  { params }: { params: { orgId: string; dossierId: string } }
) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { orgId, dossierId } = params;

  const member = await checkOrgAccess(auth.userId!, orgId, 'ADMIN');
  if (!member) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
  }

  const dossier = await prisma.dossierJuridique.findUnique({
    where: { id: dossierId, organisationId: orgId },
  });

  if (!dossier) {
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  // Génération IA du formulaire M0 basée sur le questionnaire
  const prompt = `Génère un formulaire M0 (déclaration de création d'entreprise) basé sur:\n${JSON.stringify(dossier.questionnaire, null, 2)}`;
  
  // TODO: Intégrer avec votre service IA
  const m0Content = `FORMULAIRE M0 - DÉCLARATION DE CRÉATION\n\nCadre 1 - Identification\n...\n\nGénéré automatiquement.`;

  const document = await prisma.documentJuridique.create({
    data: {
      dossierId,
      type: 'M0',
      content: m0Content,
      generatedBy: auth.userId!,
    },
  });

  await prisma.auditLog.create({
    data: {
      organisationId: orgId,
      userId: auth.userId!,
      action: 'GENERATE_M0',
      entityType: 'DOSSIER_JURIDIQUE',
      entityId: dossierId,
      metadata: { documentId: document.id },
    },
  });

  return NextResponse.json(document, { status: 201 });
}
