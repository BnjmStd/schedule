/**
 * 🛡️ Next.js Proxy — Protección de rutas autenticadas y de administración
 *
 * Corre en Edge Runtime.
 *
 * Jerarquía:
 *   1. Rutas públicas          → pasan sin verificación de sesión
 *   2. Rutas de admin          → requieren JWT válido + rol con acceso al panel
 *   3. SUPER_ADMIN en /dashboard → redirige a /admin
 *   4. Rutas protegidas generales → requieren JWT válido
 *   5. Usuarios sin schoolId   → solo pueden acceder a /dashboard
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production",
);

// Roles con acceso al panel de administración (valores del enum UserRole en Prisma)
const ADMIN_PANEL_ROLES = new Set(["OWNER", "ADMIN", "SUPER_ADMIN"]);

interface SessionPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  schoolId: string | null;
}

async function getSessionPayload(
  req: NextRequest,
): Promise<SessionPayload | null> {
  const token = req.cookies.get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.id === "string" &&
      typeof payload.email === "string" &&
      typeof payload.name === "string" &&
      typeof payload.role === "string"
    ) {
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        schoolId:
          typeof payload.schoolId === "string" ? payload.schoolId : null,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Rutas públicas ─────────────────────────────────────────────────────
  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico");

  if (isPublicPath) {
    return NextResponse.next();
  }

  // ── 2. Verificar sesión JWT ───────────────────────────────────────────────
  const session = await getSessionPayload(request);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "No autorizado", code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 3. Rutas de administración ────────────────────────────────────────────
  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute) {
    if (!ADMIN_PANEL_ROLES.has(session.role)) {
      if (isApiAdminRoute) {
        return NextResponse.json(
          {
            error: "Acceso denegado. Se requiere rol de administrador.",
            code: "FORBIDDEN",
          },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Adjuntar headers para que los route handlers puedan leer el usuario
    const headers = new Headers(request.headers);
    headers.set("x-admin-user-id", session.id);
    headers.set("x-admin-user-role", session.role);
    return NextResponse.next({ request: { headers } });
  }

  // ── 4. SUPER_ADMIN en /dashboard → redirigir al panel global ─────────────
  if (session.role === "SUPER_ADMIN" && pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // ── 5. Usuarios sin schoolId (no SUPER_ADMIN) → solo /dashboard ──────────
  if (session.role !== "SUPER_ADMIN" && !session.schoolId) {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Tu cuenta no está vinculada a ningún colegio" },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
