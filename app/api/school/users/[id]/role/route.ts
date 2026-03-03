/**
 * PATCH /api/school/users/[id]/role
 *
 * Cambia el rol de un usuario dentro del colegio.
 *
 * Reglas de jerarquía:
 *   - No se puede cambiar el propio rol (self-escalation bloqueado)
 *   - No se puede asignar rol SUPER_ADMIN vía API (solo script)
 *   - ADMIN no puede promover a nadie a OWNER
 *   - No se puede degradar al último OWNER del colegio
 *   - Transferencia de OWNER: si `role = OWNER`, el OWNER actual pasa a ADMIN
 *     automáticamente (solo OWNER actual o SUPER_ADMIN pueden hacer esto)
 *   - Solo operaciones dentro del propio colegio
 *
 * Permisos:
 *   OWNER      → puede asignar ADMIN, STAFF, VIEWER (y transferir OWNER)
 *   SUPER_ADMIN → puede asignar cualquier rol incluyendo OWNER (sin auto-degradar)
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  requireOwnerOrAdmin,
  canActorAssignRole,
  appendAuditLog,
} from "@/lib/auth-helpers";

// ─── Schema ───────────────────────────────────────────────────────────────────

const changeRoleSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "STAFF", "VIEWER"], {
    message: "Rol inálido. Valores permitidos: OWNER, ADMIN, STAFF, VIEWER",
  }),
});

// ─── PATCH /api/school/users/[id]/role ───────────────────────────────────────

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: targetUserId } = await params;
    const session = await requireOwnerOrAdmin();

    // ── Bloquear auto-cambio de rol ────────────────────────────────────────
    if (session.id === targetUserId) {
      return NextResponse.json(
        { error: "No puedes cambiar tu propio rol" },
        { status: 403 },
      );
    }

    const body = await request.json();

    // ── Bloquear intento de asignar SUPER_ADMIN vía API ───────────────────
    if (body?.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No se puede asignar el rol SUPER_ADMIN vía API" },
        { status: 403 },
      );
    }

    const { role: newRole } = changeRoleSchema.parse(body);

    // ── Verificar que el actor puede asignar este rol ─────────────────────
    if (!canActorAssignRole(session.role, newRole)) {
      return NextResponse.json(
        {
          error: `Tu rol (${session.role}) no puede asignar el rol ${newRole}`,
        },
        { status: 403 },
      );
    }

    // ── Cargar usuario objetivo ────────────────────────────────────────────
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, schoolId: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    // ── Verificar que el usuario pertenece al mismo colegio ───────────────
    const actorSchoolId = session.schoolId;

    if (session.role !== "SUPER_ADMIN") {
      if (!actorSchoolId || targetUser.schoolId !== actorSchoolId) {
        return NextResponse.json(
          { error: "No tienes permiso sobre este usuario" },
          { status: 403 },
        );
      }
    }

    const schoolId = targetUser.schoolId;

    // ── Bloquear degradación del último OWNER ─────────────────────────────
    if (targetUser.role === "OWNER" && newRole !== "OWNER") {
      const ownerCount = await prisma.user.count({
        where: { schoolId: schoolId!, role: "OWNER" },
      });
      if (ownerCount <= 1) {
        return NextResponse.json(
          {
            error:
              "No se puede degradar al único propietario del colegio. Transfiere la titularidad primero.",
          },
          { status: 400 },
        );
      }
    }

    // ── Transferencia de OWNER: hay que usar una transacción ──────────────
    if (newRole === "OWNER" && session.role !== "SUPER_ADMIN") {
      // Solo el OWNER actual puede transferir la titularidad
      if (session.role !== "OWNER") {
        return NextResponse.json(
          {
            error: "Solo el propietario actual puede transferir la titularidad",
          },
          { status: 403 },
        );
      }

      // Ejecutar transferencia atómica
      await prisma.$transaction([
        // Degradar el OWNER actual a ADMIN
        prisma.user.update({
          where: { id: session.id },
          data: { role: "ADMIN" },
        }),
        // Promover el usuario objetivo a OWNER
        prisma.user.update({
          where: { id: targetUserId },
          data: { role: "OWNER" },
        }),
      ]);

      // AuditLog doble: degradación del actor + promoción del objetivo
      await appendAuditLog({
        schoolId: schoolId!,
        actorId: session.id,
        actorRole: session.role,
        action: "OWNER_TRANSFERRED",
        entity: "User",
        entityId: targetUserId,
        metadata: {
          previousOwner: session.id,
          newOwner: targetUserId,
          previousOwnerNewRole: "ADMIN",
        },
      });

      return NextResponse.json({
        message: "Titularidad transferida exitosamente",
        previousOwner: { id: session.id, newRole: "ADMIN" },
        newOwner: { id: targetUserId, newRole: "OWNER" },
      });
    }

    // ── Cambio de rol simple ──────────────────────────────────────────────
    const oldRole = targetUser.role;

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
      },
    });

    await appendAuditLog({
      schoolId: schoolId ?? undefined,
      actorId: session.id,
      actorRole: session.role,
      action: "ROLE_CHANGED",
      entity: "User",
      entityId: targetUserId,
      metadata: {
        oldRole,
        newRole,
        targetEmail: targetUser.email,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Error de validación" },
        { status: 400 },
      );
    }
    const message = err instanceof Error ? err.message : "Error desconocido";
    const status =
      message === "No autenticado"
        ? 401
        : message.includes("rol de propietario") || message.includes("rol de")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
