import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
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

    if (!member || member.role === 'MEMBER') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const devis = await prisma.devis.findUnique({
      where: { id: devisId, organisationId: orgId },
      include: { 
        client: true, 
        organisation: true,
        lignes: true 
      },
    });

    if (!devis) {
      return NextResponse.json({ error: 'Devis non trouvé' }, { status: 404 });
    }

    const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL}/devis/${devisId}/accept?token=${devis.tokenAcces}`;
    const refuseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/devis/${devisId}/refuse?token=${devis.tokenAcces}`;
    const montantTTC = Number(devis.montantHt) + Number(devis.tva);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${devis.organisation.logoUrl ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${devis.organisation.logoUrl}" alt="${devis.organisation.name}" style="max-width: 200px; height: auto;" />
          </div>
        ` : ''}
        <h2>Nouveau devis de ${devis.organisation.name}</h2>
        <p>Bonjour,</p>
        <p>Vous avez reçu un nouveau devis :</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Devis ${devis.numero}</h3>
          <p><strong>Date d'expiration :</strong> ${new Date(devis.dateExpiration).toLocaleDateString('fr-FR')}</p>
          <p><strong>Montant HT :</strong> ${Number(devis.montantHt).toFixed(2)} €</p>
          <p><strong>TVA :</strong> ${Number(devis.tva).toFixed(2)} €</p>
          <p><strong>Montant TTC :</strong> ${montantTTC.toFixed(2)} €</p>
        </div>

        <h4>Détail des prestations :</h4>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Quantité</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Prix HT</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total HT</th>
            </tr>
          </thead>
          <tbody>
            ${devis.lignes.map(ligne => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${ligne.description}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${ligne.quantite}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${Number(ligne.prixUnitaireHt).toFixed(2)} €</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${(Number(ligne.quantite) * Number(ligne.prixUnitaireHt)).toFixed(2)} €</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${acceptUrl}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">Accepter le devis</a>
          <a href="${refuseUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 0 10px; display: inline-block;">Refuser le devis</a>
        </div>

        <p style="color: #666; font-size: 14px;">Ce devis est valable jusqu'au ${new Date(devis.dateExpiration).toLocaleDateString('fr-FR')}.</p>
        <p style="color: #666; font-size: 14px;">Cordialement,<br>${devis.organisation.name}</p>
      </div>
    `;

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: devis.client.email,
      subject: `Nouveau devis ${devis.numero} - ${devis.organisation.name}`,
      html: emailHtml,
    });

    await prisma.devis.update({
      where: { id: devisId },
      data: { statut: 'ENVOYE' },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        organisationId: orgId,
        action: 'SEND_DEVIS',
        module: 'facturation',
        payload: { devisId, clientEmail: devis.client.email },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
