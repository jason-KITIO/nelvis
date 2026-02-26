import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const organisations = await prisma.orgMember.findMany({
    where: { userId: auth.userId },
    include: {
      organisation: {
        include: { modules: true },
      },
    },
  });

  return NextResponse.json({
    organisations: organisations.map(m => ({
      id: m.organisation.id,
      name: m.organisation.name,
      role: m.role,
      siret: m.organisation.siret,
      logoUrl: m.organisation.logoUrl,
      adresse: m.organisation.adresse,
      pays: m.organisation.pays,
      modules: m.organisation.modules,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await authenticate(req);
  if (auth.error) return auth.error;

  const { name, siret, siren, formeJuridique, pays, adresse, logoUrl, charteGraphique, modules } = await req.json();

  if (!name || !formeJuridique || !pays || !adresse) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
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
          role: 'OWNER',
          acceptedAt: new Date(),
        },
      },
      modules: {
        create: modules || {},
      },
      dossiersJuridiques: {
        create: {
          statut: 'DRAFT',
          formeJuridique,
          questionnaire: { pays, adresse, siret, siren },
        },
      },
    },
    include: { modules: true },
  });

  await prisma.auditLog.create({
    data: {
      organisationId: organisation.id,
      userId: auth.userId!,
      action: 'CREATE_ORGANISATION',
      module: 'ORGANISATION',
      payload: { name, formeJuridique },
    },
  });

  return NextResponse.json({ organisation }, { status: 201 });
}
