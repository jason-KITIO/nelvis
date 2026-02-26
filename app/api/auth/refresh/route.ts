import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signToken, setAuthCookies } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie');
    console.log('🍪 Cookies reçus:', cookieHeader);
    
    const match = cookieHeader?.match(/(?:^|;\s*)refreshToken=([^;]+)/);
    const refreshToken = match?.[1];
    console.log('🔑 RefreshToken extrait:', refreshToken ? 'Présent' : 'Absent');

    if (!refreshToken) {
      console.error('❌ Aucun refreshToken trouvé dans les cookies');
      return NextResponse.json({ error: 'Refresh token requis' }, { status: 400 });
    }

    const payload = await verifyToken(refreshToken);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    const accessToken = await signToken({ userId: payload.userId }, '30d');
    const newRefreshToken = await signToken({ userId: payload.userId }, '30d');
    
    const response = NextResponse.json({ success: true });
    const cookies = setAuthCookies(accessToken, newRefreshToken);
    cookies.forEach(cookie => response.headers.append('Set-Cookie', cookie));
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
