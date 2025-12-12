import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Rutas públicas que no requieren auth
  const isPublicPath = 
    path === '/' ||
    path.startsWith('/auth') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') ||
    path.startsWith('/favicon.ico');

  // Si es ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Para rutas protegidas, verificar si hay token de sesión
  const token = request.cookies.get('next-auth.session-token') || 
                request.cookies.get('__Secure-next-auth.session-token');

  // Si no hay token y trata de acceder a ruta protegida, redirigir a login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Si tiene token, permitir acceso
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
