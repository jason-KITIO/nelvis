import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { signToken, setAuthCookies } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orgMemberships: {
          include: {
            organisation: true,
          },
        },
      },
    });

    if (!user || !await verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Compte désactivé' },
        { status: 403 }
      );
    }

    const accessToken = await signToken({ userId: user.id }, '30d');
    const refreshToken = await signToken({ userId: user.id }, '30d');

    console.log('🔐 Tokens générés pour userId:', user.id);
    console.log('📝 AccessToken:', accessToken.substring(0, 20) + '...');
    console.log('📝 RefreshToken:', refreshToken.substring(0, 20) + '...');

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      organisations: user.orgMemberships.map(m => ({
        id: m.organisation.id,
        name: m.organisation.name,
        role: m.role,
      })),
    });

    const cookies = setAuthCookies(accessToken, refreshToken);
    console.log('🍪 Cookies à définir:', cookies);
    cookies.forEach(cookie => response.headers.append('Set-Cookie', cookie));

    return response;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
