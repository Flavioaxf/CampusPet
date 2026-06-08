import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth/jwt';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define paths that require authentication
  const isBackofficeRoute = pathname.startsWith('/backoffice') || 
                            pathname.startsWith('/animais') || 
                            pathname.startsWith('/financeiro') ||
                            pathname.startsWith('/campo') ||
                            pathname.startsWith('/relatorios') ||
                            pathname.startsWith('/configuracoes');

  // 2. Define public-only paths (like login)
  const isPublicOnlyRoute = pathname === '/login';

  if (isBackofficeRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
      // Token invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // RBAC: Example of restricted routes for Gestor only
    const isGestorOnlyRoute = pathname.startsWith('/configuracoes') || 
                             pathname.startsWith('/usuarios');
    
    if (isGestorOnlyRoute && payload.perfil !== 'GESTOR') {
      return NextResponse.redirect(new URL('/backoffice', request.url)); // Or an unauthorized page
    }
  }

  if (isPublicOnlyRoute && token) {
    const payload = verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL('/backoffice', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
