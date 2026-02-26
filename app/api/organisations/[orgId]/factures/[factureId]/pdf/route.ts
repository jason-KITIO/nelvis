import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import jsPDF from 'jspdf';

export async function GET(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const { orgId, factureId } = await params;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    // Vérifier soit la session, soit le token public
    const session = await getSession();
    if (!session && !token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Si token public, vérifier qu'il correspond à la facture
    if (token && !session) {
      const factureWithToken = await prisma.facture.findFirst({
        where: { id: factureId, organisationId: orgId, tokenAcces: token },
      });
      if (!factureWithToken) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }
    }

    const facture = await prisma.facture.findFirst({
      where: { id: factureId, organisationId: orgId },
      include: { 
        client: true,
        lignes: true,
        organisation: { select: { name: true, adresse: true, siret: true, logoUrl: true, charteGraphique: true } }
      },
    });

    if (!facture) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });

    // Générer le PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Couleur principale (depuis charte graphique ou défaut)
    const primaryColor = facture.organisation.charteGraphique?.primaryColor || '#2563eb';
    
    // En-tête avec logo et infos organisation
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text(facture.organisation.name, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(facture.organisation.adresse || '', 20, 28);
    if (facture.organisation.siret) {
      doc.text(`SIRET: ${facture.organisation.siret}`, 20, 34);
    }
    
    // Titre FACTURE
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text('FACTURE', pageWidth - 20, 20, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`N° ${facture.numero}`, pageWidth - 20, 28, { align: 'right' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${new Date(facture.createdAt).toLocaleDateString('fr-FR')}`, pageWidth - 20, 34, { align: 'right' });
    doc.text(`Échéance: ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}`, pageWidth - 20, 40, { align: 'right' });
    
    // Informations client
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Facturé à:', 20, 55);
    doc.setFontSize(10);
    doc.text(facture.client.nom, 20, 62);
    doc.text(facture.client.email, 20, 68);
    if (facture.client.adresse) {
      doc.text(facture.client.adresse, 20, 74);
    }
    if (facture.client.siret) {
      doc.text(`SIRET: ${facture.client.siret}`, 20, 80);
    }
    
    // Tableau des lignes
    const startY = 100;
    doc.setFillColor(primaryColor);
    doc.rect(20, startY, pageWidth - 40, 8, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.text('Description', 22, startY + 5);
    doc.text('Qté', pageWidth - 90, startY + 5, { align: 'right' });
    doc.text('Prix HT', pageWidth - 65, startY + 5, { align: 'right' });
    doc.text('TVA', pageWidth - 40, startY + 5, { align: 'right' });
    doc.text('Total HT', pageWidth - 22, startY + 5, { align: 'right' });
    
    let currentY = startY + 12;
    doc.setTextColor(0);
    
    facture.lignes.forEach((ligne: any) => {
      const totalLigne = Number(ligne.quantite) * Number(ligne.prixUnitaireHt);
      doc.text(ligne.description, 22, currentY);
      doc.text(ligne.quantite.toString(), pageWidth - 90, currentY, { align: 'right' });
      doc.text(`${Number(ligne.prixUnitaireHt).toFixed(2)} €`, pageWidth - 65, currentY, { align: 'right' });
      doc.text(`${ligne.tauxTva}%`, pageWidth - 40, currentY, { align: 'right' });
      doc.text(`${totalLigne.toFixed(2)} €`, pageWidth - 22, currentY, { align: 'right' });
      currentY += 8;
    });
    
    // Ligne de séparation
    currentY += 5;
    doc.setDrawColor(200);
    doc.line(20, currentY, pageWidth - 20, currentY);
    
    // Totaux
    currentY += 10;
    doc.setFontSize(10);
    doc.text('Total HT:', pageWidth - 60, currentY);
    doc.text(`${Number(facture.montantHt).toFixed(2)} €`, pageWidth - 22, currentY, { align: 'right' });
    
    currentY += 7;
    doc.text('TVA:', pageWidth - 60, currentY);
    doc.text(`${Number(facture.tvaMontant).toFixed(2)} €`, pageWidth - 22, currentY, { align: 'right' });
    
    currentY += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Total TTC:', pageWidth - 60, currentY);
    const totalTTC = Number(facture.montantHt) + Number(facture.tvaMontant);
    doc.text(`${totalTTC.toFixed(2)} €`, pageWidth - 22, currentY, { align: 'right' });
    
    // Pied de page
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100);
    doc.text('Conditions de paiement: Paiement à réception de facture', pageWidth / 2, footerY, { align: 'center' });
    
    // Générer le buffer PDF
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="facture-${facture.numero}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erreur PDF facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
