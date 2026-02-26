import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/middleware";

const PLANS = {
  starter: { price: 49, modules: 1, users: 5 },
  business: { price: 149, modules: 3, users: 20 },
  enterprise: { price: 399, modules: 999, users: 999 },
};

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const {
      name,
      siret,
      siren,
      formeJuridique,
      pays,
      adresse,
      logoUrl,
      charteGraphique,
      modules,
      selectedPlan,
    } = await req.json();

    if (!name || !formeJuridique || !pays || !adresse || !selectedPlan) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 }
      );
    }

    const plan = PLANS[selectedPlan as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const organisation = await prisma.organisation.create({
      data: {
        name,
        siret,
        siren,
        formeJuridique,
        pays,
        adresse,
        logoUrl,
        charteGraphique,
        members: {
          create: {
            userId: auth.userId!,
            role: "OWNER",
            acceptedAt: new Date(),
          },
        },
        modules: {
          create: modules || {},
        },
        subscriptions: {
          create: {
            module: selectedPlan,
            type: "ABONNEMENT",
            montant: plan.price,
            statut: "ACTIF",
            debut: new Date(),
            fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        dossiersJuridiques: {
          create: {
            statut: "DRAFT",
            formeJuridique,
            questionnaire: { pays, adresse, siret, siren },
          },
        },
      },
      include: { modules: true, subscriptions: true },
    });

    await prisma.auditLog.create({
      data: {
        organisationId: organisation.id,
        userId: auth.userId!,
        action: "CREATE_ORGANISATION_WITH_PLAN",
        module: "ORGANISATION",
        payload: { name, formeJuridique, selectedPlan },
      },
    });

    return NextResponse.json({ organisation }, { status: 201 });
  } catch (error) {
    console.error("Erreur création organisation:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
