import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string; factureId: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { orgId, factureId } = await params;

    const facture = await prisma.facture.findFirst({
      where: { id: factureId, organisationId: orgId },
      include: { client: true, organisation: true },
    });

    if (!facture) return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });

    // Générer un token si n'existe pas
    let tokenAcces = facture.tokenAcces;
    if (!tokenAcces) {
      const updated = await prisma.facture.update({
        where: { id: factureId },
        data: { tokenAcces: crypto.randomUUID() },
      });
      tokenAcces = updated.tokenAcces;
    }

    // Générer un token d'accès valide 30 jours
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

    await prisma.facture.update({
      where: { id: factureId },
      data: { tokenExpiresAt },
    });

    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/facture/${factureId}/pay?token=${tokenAcces}`;
    const montantTTC = Number(facture.montantHt) + Number(facture.tvaMontant);

    // Envoyer l'email avec le lien de paiement
    try {
      console.log('Envoi email à:', facture.client.email);
      const emailResult = await resend.emails.send({
        from: process.env.EMAIL_FROM!,
        to: facture.client.email,
        subject: `Facture ${facture.numero} - ${facture.organisation.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Nouvelle facture</h2>
            <p>Bonjour,</p>
            <p>Vous avez reçu une nouvelle facture de la part de <strong>${facture.organisation.name}</strong>.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Numéro :</strong> ${facture.numero}</p>
              <p style="margin: 5px 0;"><strong>Montant TTC :</strong> ${montantTTC.toFixed(2)} €</p>
              <p style="margin: 5px 0;"><strong>Date d'échéance :</strong> ${new Date(facture.dateEcheance).toLocaleDateString('fr-FR')}</p>
            </div>

            <p>Vous pouvez consulter et payer cette facture en ligne en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${paymentUrl}" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir et payer la facture
              </a>
            </div>

            <p style="color: #666; font-size: 12px;">Ce lien est valide pendant 30 jours.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
            
            <p style="color: #666; font-size: 12px;">
              ${facture.organisation.name}<br/>
              ${facture.organisation.adresse}<br/>
              ${facture.organisation.siret ? `SIRET: ${facture.organisation.siret}` : ''}
            </p>
          </div>
        `,
      });
      console.log('Email envoyé avec succès:', emailResult);
    } catch (emailError) {
      console.error('Erreur détaillée envoi email:', emailError);
    }

    return NextResponse.json({ success: true, facture, paymentUrl });
  } catch (error) {
    console.error('Erreur send facture:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
