import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.type !== 'reset' || !payload.userId) {
      return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { passwordHash },
    });

    return NextResponse.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
