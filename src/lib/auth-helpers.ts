/**
 * 🔐 Helpers de autenticación y autorización
 *
 * Arquitectura: School es la entidad raíz.
 * Los usuarios pertenecen a un School via User.schoolId.
 *
 * Roles (ver UserRole enum en schema.prisma):
 *   OWNER       → acceso total incluyendo billing
 *   ADMIN       → acceso total excepto billing
 *   STAFF       → acceso operativo limitado
 *   VIEWER      → solo lectura
 *   SUPER_ADMIN → panel global, schoolId = null
 */

import { getSession } from "./session";
import { prisma } from "./prisma";

/** Roles con capacidad de escritura sobre recursos del colegio */
const WRITE_ROLES = new Set(["OWNER", "ADMIN", "STAFF"]);
/** Roles con acceso al panel de administración */
const ADMIN_PANEL_ROLES = new Set(["OWNER", "ADMIN", "SUPER_ADMIN"]);
/** Roles con acceso a configuración de billing */
const BILLING_ROLES = new Set(["OWNER", "SUPER_ADMIN"]);

// ── Sesión actual ─────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  return session;
}

// ── Acceso al school ──────────────────────────────────────────────────────────

/**
 * Devuelve el schoolId del usuario en sesión.
 * Lanza error si no tiene colegio asignado (ej. SUPER_ADMIN sin contexto).
 */
export async function getSessionSchoolId(): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  if (!session.schoolId)
    throw new Error("El usuario no tiene colegio asignado");
  return session.schoolId;
}

/**
 * Verifica que el usuario en sesión pertenece al schoolId dado.
 * SUPER_ADMIN tiene acceso a todos los colegios.
 */
export async function userHasAccessToSchool(
  schoolId: string,
): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  if (session.role === "SUPER_ADMIN") return true;
  return session.schoolId === schoolId;
}

/**
 * Devuelve el rol del usuario en sesión dentro de su colegio.
 */
export async function getSessionUserRole(): Promise<string | null> {
  const session = await getSession();
  return session?.role ?? null;
}

// ── Guards ────────────────────────────────────────────────────────────────────

/** Lanza error si el usuario no puede escribir recursos en su colegio */
export async function requireWriteAccess(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  if (!WRITE_ROLES.has(session.role)) {
    throw new Error("No tienes permisos para realizar esta acción");
  }
}

/** Lanza error si el usuario no tiene acceso al panel de administración */
export async function requireAdminPanel(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  if (!ADMIN_PANEL_ROLES.has(session.role)) {
    throw new Error("Acceso restringido al panel de administración");
  }
}

/** Lanza error si el usuario no puede administrar billing */
export async function requireBillingAccess(): Promise<void> {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  if (!BILLING_ROLES.has(session.role)) {
    throw new Error(
      "Solo el propietario del colegio puede gestionar la suscripción",
    );
  }
}

// ── Suscripción del colegio ────────────────────────────────────────────────────

/**
 * Obtiene la suscripción activa del colegio del usuario en sesión.
 * Útil para aplicar límites de plan en mutations.
 */
export async function getSchoolSubscription(schoolId?: string) {
  const sid = schoolId ?? (await getSessionSchoolId());
  return prisma.schoolSubscription.findUnique({
    where: { schoolId: sid },
    select: {
      plan: true,
      status: true,
      currentPeriodEnd: true,
      trialEndsAt: true,
    },
  });
}

/**
 * Devuelve true si el colegio tiene suscripción activa o en trial.
 */
export async function isSchoolSubscriptionActive(
  schoolId?: string,
): Promise<boolean> {
  const sub = await getSchoolSubscription(schoolId);
  if (!sub) return false;
  return sub.status === "ACTIVE" || sub.status === "TRIALING";
}

// ── Jerarquía de roles ────────────────────────────────────────────────────────

/**
 * Qué roles puede crear cada rol.
 * SUPER_ADMIN puede crear cualquier rol excepto otro SUPER_ADMIN
 * (eso se hace solo vía script).
 */
export const CREATABLE_ROLES: Record<string, string[]> = {
  OWNER: ["ADMIN", "STAFF", "VIEWER"],
  ADMIN: ["STAFF", "VIEWER"],
  SUPER_ADMIN: ["OWNER", "ADMIN", "STAFF", "VIEWER"],
};

/**
 * Qué roles puede cambiar/asignar cada rol.
 * Reglas adicionales:
 *   - Nadie puede cambiar su propio rol
 *   - No se puede degradar al último OWNER (eso debe validarse en la API)
 *   - No se puede crear ni promover a SUPER_ADMIN desde la API (solo script)
 */
export const ASSIGNABLE_ROLES: Record<string, string[]> = {
  OWNER: ["ADMIN", "STAFF", "VIEWER"], // OWNER puede promover/degradar dentro de su colegio
  SUPER_ADMIN: ["OWNER", "ADMIN", "STAFF", "VIEWER"], // SUPER_ADMIN puede cambiar cualquier rol (no SUPER_ADMIN)
};

/**
 * ¿Puede el actor con `actorRole` crear un usuario con `targetRole`?
 */
export function canActorCreateRole(
  actorRole: string,
  targetRole: string,
): boolean {
  return (CREATABLE_ROLES[actorRole] ?? []).includes(targetRole);
}

/**
 * ¿Puede el actor con `actorRole` asignar `newRole` a otro usuario?
 */
export function canActorAssignRole(
  actorRole: string,
  newRole: string,
): boolean {
  return (ASSIGNABLE_ROLES[actorRole] ?? []).includes(newRole);
}

// ── Guards adicionales ────────────────────────────────────────────────────────

/**
 * Requiere que el usuario en sesión sea OWNER o SUPER_ADMIN.
 * Devuelve la sesión si pasa, lanza error si no.
 */
export async function requireOwner() {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  if (session.role !== "OWNER" && session.role !== "SUPER_ADMIN") {
    throw new Error(
      "Solo el propietario del colegio puede realizar esta acción",
    );
  }
  return session;
}

/**
 * Requiere que el usuario en sesión sea OWNER, ADMIN o SUPER_ADMIN.
 * Devuelve la sesión si pasa, lanza error si no.
 */
export async function requireOwnerOrAdmin() {
  const session = await getSession();
  if (!session) throw new Error("No autenticado");
  const allowed = ["OWNER", "ADMIN", "SUPER_ADMIN"];
  if (!allowed.includes(session.role)) {
    throw new Error("Se requiere rol de propietario o administrador");
  }
  return session;
}

// ── Audit Log helper ──────────────────────────────────────────────────────────

export interface AuditLogEntry {
  schoolId?: string | null;
  actorId: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registra una entrada en el AuditLog.
 * No lanza excepción si falla — el log es best-effort para no bloquear
 * operaciones críticas. Sí imprime el error en consola.
 */
export async function appendAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        schoolId: entry.schoolId ?? null,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        metadata: JSON.stringify(entry.metadata ?? {}),
      },
    });
  } catch (err) {
    console.error("[auditLog] Error al registrar entrada:", err);
  }
}
