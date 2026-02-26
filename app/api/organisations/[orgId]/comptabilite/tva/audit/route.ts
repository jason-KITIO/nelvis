// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { authenticate, checkOrgAccess } from "@/lib/middleware";
// import Anthropic from "@anthropic-ai/sdk";

// const anthropic = new Anthropic({
//   apiKey: process.env.ANTHROPIC_API_KEY,
// });

// export async function POST(
//   req: NextRequest,
//   { params }: { params: Promise<{ orgId: string }> }
// ) {
//   try {
//     const auth = await authenticate(req);
//     if (auth.error) return auth.error;

//     const { orgId } = await params;
//     const member = await checkOrgAccess(auth.userId!, orgId);
//     if (!member) {
//       return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
//     }

//     const body = await req.json();
//     const { periode } = body; // Format: YYYY-MM

//     // Récupérer les factures de la période
//     const [year, month] = periode.split("-");
//     const dateDebut = new Date(`${year}-${month}-01`);
//     const dateFin = new Date(dateDebut);
//     dateFin.setMonth(dateFin.getMonth() + 1);

//     const factures = await prisma.facture.findMany({
//       where: {
//         organisationId: orgId,
//         createdAt: {
//           gte: dateDebut,
//           lt: dateFin,
//         },
//       },
//       include: {
//         lignes: true,
//       },
//     });

//     // Calculer TVA collectée et déductible
//     let tvaCollectee = 0;
//     let tvaDeductible = 0;

//     factures.forEach((f) => {
//       if (f.statut === "PAYEE") {
//         tvaCollectee += Number(f.tvaMontant);
//       }
//     });

//     // Analyse IA des anomalies
//     const prompt = `Analyse les données TVA suivantes pour la période ${periode}:
// - TVA collectée: ${tvaCollectee}€
// - TVA déductible: ${tvaDeductible}€
// - Nombre de factures: ${factures.length}

// Détecte les anomalies potentielles (taux incohérents, montants suspects, etc.) et retourne un JSON avec:
// {
//   "anomalies": [{"type": "...", "description": "...", "gravite": "LOW|MEDIUM|HIGH"}],
//   "recommandations": ["..."]
// }`;

//     const message = await anthropic.messages.create({
//       model: "claude-3-5-sonnet-20241022",
//       max_tokens: 1024,
//       messages: [{ role: "user", content: prompt }],
//     });

//     const content = message.content[0];
//     const aiResponse = content.type === "text" ? JSON.parse(content.text) : { anomalies: [], recommandations: [] };

//     const soldeTva = tvaCollectee - tvaDeductible;

//     const rapport = await prisma.rapportTVA.create({
//       data: {
//         organisationId: orgId,
//         periode,
//         tvaCollectee,
//         tvaDeductible,
//         soldeTva,
//         anomalies: aiResponse,
//       },
//     });

//     await prisma.auditLog.create({
//       data: {
//         userId: auth.userId!,
//         organisationId: orgId,
//         action: "AUDIT_TVA",
//         module: "COMPTABILITE",
//         payload: { rapportId: rapport.id, periode },
//         iaAgent: "claude-3-5-sonnet",
//       },
//     });

//     return NextResponse.json(rapport, { status: 201 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
//   }
// }
