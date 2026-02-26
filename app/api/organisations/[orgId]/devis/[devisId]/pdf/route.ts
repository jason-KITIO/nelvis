import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import jsPDF from 'jspdf';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; devisId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { orgId, devisId } = await params;

    const member = await prisma.orgMember.findUnique({
      where: {
        userId_organisationId: {
          userId: session.userId,
          organisationId: orgId,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const devis = await prisma.devis.findUnique({
      where: { id: devisId, organisationId: orgId },
      include: {
        client: true,
        organisation: true,
        lignes: true,
      },
    });

    if (!devis) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('DEVIS', 105, 20, { align: 'center' } as any);
    
    doc.setFontSize(10);
    doc.text(devis.organisation.name || '', 20, 40);
    doc.text(devis.organisation.adresse || '', 20, 45);
    if (devis.organisation.siret) doc.text('SIRET: ' + devis.organisation.siret, 20, 50);
    
    doc.text(devis.client.nom || '', 120, 40);
    doc.text(devis.client.adresse || '', 120, 45);
    if (devis.client.siret) doc.text('SIRET: ' + devis.client.siret, 120, 50);
    
    doc.text('Numero: ' + devis.numero, 20, 70);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 20, 75);
    doc.text('Expiration: ' + new Date(devis.dateExpiration).toLocaleDateString('fr-FR'), 20, 80);
    
    let y = 100;
    doc.setFontSize(12);
    doc.text('Description', 20, y);
    doc.text('Qte', 100, y);
    doc.text('Prix HT', 120, y);
    doc.text('TVA', 150, y);
    doc.text('Total HT', 170, y);
    
    y += 10;
    doc.setFontSize(10);
    
    if (devis.lignes.length === 0) {
      doc.text('Aucune ligne de produit', 20, y);
      y += 10;
    }
    
    devis.lignes.forEach((ligne) => {
      const totalLigne = Number(ligne.quantite) * Number(ligne.prixUnitaireHt);
      doc.text(ligne.description || '', 20, y);
      doc.text(String(ligne.quantite), 100, y);
      doc.text(Number(ligne.prixUnitaireHt).toFixed(2) + ' EUR', 120, y);
      doc.text(Number(ligne.tauxTva).toFixed(0) + '%', 150, y);
      doc.text(totalLigne.toFixed(2) + ' EUR', 170, y);
      y += 7;
    });
    
    y += 10;
    doc.text('Total HT: ' + Number(devis.montantHt).toFixed(2) + ' EUR', 150, y);
    y += 7;
    doc.text('TVA: ' + Number(devis.tva).toFixed(2) + ' EUR', 150, y);
    y += 7;
    doc.setFontSize(12);
    doc.text('Total TTC: ' + (Number(devis.montantHt) + Number(devis.tva)).toFixed(2) + ' EUR', 150, y);

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'DOWNLOAD_DEVIS_PDF',
        module: 'facturation',
        payload: { devisId },
      },
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="devis-${devis.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
