/**
 * 🛡️ Next.js Proxy — Protección de rutas autenticadas y de administración
 *
 * Corre en Edge Runtime.
 * - Rutas generales (/dashboard, /courses, etc.): verifica presencia de cookie de sesión.
 * - Rutas de admin (/admin/*, /api/admin/*): verifica JWT completo y exige rol admin/super_admin.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

const ADMIN_ROLES = ["admin", "super_admin"] as const;
type AdminRole = (typeof ADMIN_ROLES)[number];

function isAdminRole(role: unknown): role is AdminRole {
  return typeof role === "string" && ADMIN_ROLES.includes(role as AdminRole);
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rutas públicas ──────────────────────────────────────────────────────────
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico");

  if (isPublicPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  // ── Rutas de administración ─────────────────────────────────────────────────
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    if (!token) {
      if (isApiAdminRoute) {
        return NextResponse.json(
          { error: "No autorizado", code: "UNAUTHENTICATED" },
          { status: 401 },
        );
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, secret);

      if (!isAdminRole(payload.role)) {
        if (isApiAdminRoute) {
          return NextResponse.json(
            { error: "Acceso denegado. Se requiere rol de administrador.", code: "FORBIDDEN" },
            { status: 403 },
          );
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      // Adjuntar headers para que las rutas conozcan el usuario sin re-verificar
      const headers = new Headers(request.headers);
      headers.set("x-admin-user-id", String(payload.id ?? ""));
      headers.set("x-admin-user-role", String(payload.role));
      return NextResponse.next({ request: { headers } });
    } catch {
      if (isApiAdminRoute) {
        return NextResponse.json(
          { error: "Sesión inválida o expirada", code: "INVALID_TOKEN" },
          { status: 401 },
        );
      }
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Rutas protegidas generales ──────────────────────────────────────────────
  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
