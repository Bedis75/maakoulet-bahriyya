import { NextResponse, type NextRequest } from 'next/server';

import { COOKIE_SESSION, verifierSession } from '@/lib/auth-edge';

/**
 * Protège tout /admin sauf la page de connexion.
 * Le middleware s'exécute sur le runtime Edge : il ne fait que vérifier la
 * signature du jeton (jose), sans accès à la base.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const estLogin = pathname === '/admin/login';
  const session = await verifierSession(request.cookies.get(COOKIE_SESSION)?.value);

  if (estLogin) {
    if (session) return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('suite', pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
