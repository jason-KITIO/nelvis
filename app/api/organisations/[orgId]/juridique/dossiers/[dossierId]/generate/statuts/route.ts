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

  // Génération IA des statuts basée sur le questionnaire
  const prompt = `Génère les statuts d'une société française basés sur ces informations:\n${JSON.stringify(dossier.questionnaire, null, 2)}`;
  
  // TODO: Intégrer avec votre service IA (OpenAI, Claude, etc.)
  const statutsContent = `STATUTS DE LA SOCIÉTÉ\n\nArticle 1 - Forme\n...\n\nGénéré à partir du questionnaire.`;

  const document = await prisma.documentJuridique.create({
    data: {
      dossierId,
      type: 'STATUTS',
      contenu: statutsContent,
      fichierUrl: '',
    },
  });

  await prisma.auditLog.create({
    data: {
      organisationId: orgId,
      userId: auth.userId!,
      action: 'GENERATE_STATUTS',
      module: 'juridique',
      payload: { dossierId, documentId: document.id },
    },
  });

  return NextResponse.json(document, { status: 201 });
}
