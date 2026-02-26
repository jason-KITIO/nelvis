import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const publicRoutes = ['/login', '/signup', '/reset-password', '/forgot-password', '/create-password', '/devis', '/facture', '/paiement'];
const authRoutes = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware check:', pathname);

  // Routes publiques : pas d'auth requise
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/onboarding');
  if (isPublicRoute) {
    console.log('✅ Route publique autorisée:', pathname);
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;
  const session = token ? await verifyToken(token) : null;
  const isAuthenticated = !!session?.userId;

  // Si connecté et sur page auth → redirect /organisation
  if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/organisation', request.url));
  }

  // Si non connecté → redirect /login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|img|facture|.*\\.svg|.*\\.png).*)',
  ],
};
