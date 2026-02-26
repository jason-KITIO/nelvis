import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Mots de passe requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });

    if (!user || !await verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: payload.userId as string },
      data: { passwordHash },
    });

    return NextResponse.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
