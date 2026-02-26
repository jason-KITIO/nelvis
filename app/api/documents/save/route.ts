import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { type, contenu, extractedData, orgId } = await req.json();

    let dossier = await prisma.dossierJuridique.findFirst({
      where: { organisationId: orgId }
    });

    if (!dossier) {
      dossier = await prisma.dossierJuridique.create({
        data: {
          organisationId: orgId,
          statut: 'DRAFT',
          formeJuridique: extractedData.formeJuridique || 'SAS',
          questionnaire: extractedData
        }
      });
    }

    const document = await prisma.documentJuridique.create({
      data: {
        dossierId: dossier.id,
        type: type,
        contenu: contenu,
        fichierUrl: ''
      }
    });

    return NextResponse.json({ success: true, documentId: document.id });

  } catch (error) {
    console.error('Save document error:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}
