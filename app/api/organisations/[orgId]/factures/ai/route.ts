import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createFactureAISchema } from '@/lib/validations/facture';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const body = await req.json();
    createFactureAISchema.parse(body);

    // TODO: Intégrer avec service IA (OpenAI/Bedrock) pour parser la commande
    // Pour l'instant, retourner une erreur indiquant que c'est en développement
    return NextResponse.json(
      { error: 'Fonctionnalité IA en cours de développement' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Erreur POST facture AI:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
