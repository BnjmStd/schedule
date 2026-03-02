/**
 * 🔐 Admin Auth Helper
 *
 * Verificación de rol de administrador para server actions y API routes.
 * El middleware ya filtra las rutas, pero estas funciones proveen
 * defensa en profundidad para cada handler individual.
 */

import { getSession } from "@/lib/session";
import type { SessionData } from "@/lib/session";

export type AdminRole = "admin" | "super_admin";

export function isAdminRole(role: string): role is AdminRole {
  return role === "admin" || role === "super_admin";
}

/**
 * Verifica que la sesión exista y tenga rol admin/super_admin.
 * Lanza un error si no cumple — úsalo en API routes y server actions de admin.
 */
export async function requireAdminSession(): Promise<SessionData> {
  const session = await getSession();

  if (!session) {
    throw new Error("UNAUTHENTICATED");
  }

  if (!isAdminRole(session.role)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

/**
 * Versión que devuelve null en lugar de lanzar — útil para layouts.
 */
export async function getAdminSession(): Promise<SessionData | null> {
  try {
    return await requireAdminSession();
  } catch {
    return null;
  }
}

/**
 * Reusable JSON error responses para API routes de admin.
 */
export function adminErrorResponse(
  error: unknown,
): { body: object; status: number } {
  if (error instanceof Error) {
    if (error.message === "UNAUTHENTICATED") {
      return { body: { error: "No autorizado" }, status: 401 };
    }
    if (error.message === "FORBIDDEN") {
      return { body: { error: "Acceso denegado" }, status: 403 };
    }
  }
  console.error("[Admin API Error]", error);
  return { body: { error: "Error interno del servidor" }, status: 500 };
}
