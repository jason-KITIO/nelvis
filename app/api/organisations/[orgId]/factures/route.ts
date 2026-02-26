import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createFactureSchema } from "@/lib/validations/facture";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { orgId } = await params;
    const { searchParams } = new URL(req.url);
    const statut = searchParams.get("statut");
    const clientId = searchParams.get("clientId");
    const dateDebut = searchParams.get("dateDebut");
    const dateFin = searchParams.get("dateFin");

    const where: Record<string, unknown> = { organisationId: orgId };
    if (statut) where.statut = statut;
    if (clientId) where.clientId = clientId;
    if (dateDebut || dateFin) {
      where.createdAt = {};
      if (dateDebut) (where.createdAt as Record<string, unknown>).gte = new Date(dateDebut);
      if (dateFin) (where.createdAt as Record<string, unknown>).lte = new Date(dateFin);
    }

    const factures = await prisma.facture.findMany({
      where,
      include: { client: { select: { id: true, nom: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ factures });
  } catch (error) {
    console.error("Erreur GET factures:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> },
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { orgId } = await params;
    const body = await req.json();
    const validated = createFactureSchema.parse(body);

    const lastFacture = await prisma.facture.findFirst({
      where: { organisationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    const numero = lastFacture
      ? `F${(parseInt(lastFacture.numero.slice(1)) + 1).toString().padStart(6, "0")}`
      : "F000001";

    const montantHt = validated.lignes.reduce(
      (sum, ligne) => sum + ligne.quantite * ligne.prixUnitaireHt,
      0,
    );

    const tvaMontant = validated.lignes.reduce(
      (sum, ligne) =>
        sum + (ligne.quantite * ligne.prixUnitaireHt * ligne.tauxTva) / 100,
      0,
    );

    const facture = await prisma.facture.create({
      data: {
        organisationId: orgId,
        clientId: validated.clientId,
        numero,
        statut: "EMISE",
        montantHt,
        tvaMontant,
        dateEcheance: new Date(validated.dateEcheance),
        tokenAcces: crypto.randomUUID(),
        lignes: {
          create: validated.lignes.map((ligne) => ({
            produitId: ligne.produitId,
            description: ligne.description,
            quantite: ligne.quantite,
            prixUnitaireHt: ligne.prixUnitaireHt,
            tauxTva: ligne.tauxTva,
          })),
        },
      },
      include: {
        client: { select: { id: true, nom: true, email: true } },
        lignes: true,
        organisation: true,
      },
    });

    // Envoyer automatiquement l'email au client
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30);

    await prisma.facture.update({
      where: { id: facture.id },
      data: { tokenExpiresAt },
    });

    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/facture/${facture.id}/pay?token=${facture.tokenAcces}`;
    const montantTTC = Number(facture.montantHt) + Number(facture.tvaMontant);

    try {
      console.log("Envoi email à:", facture.client.email);
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
              <p style="margin: 5px 0;"><strong>Date d'échéance :</strong> ${new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}</p>
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
              ${facture.organisation.siret ? `SIRET: ${facture.organisation.siret}` : ""}
            </p>
          </div>
        `,
      });
      console.log("Email envoyé avec succès:", emailResult);
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
    }

    return NextResponse.json({ facture }, { status: 201 });
  } catch (error) {
    console.error("Erreur POST facture:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
