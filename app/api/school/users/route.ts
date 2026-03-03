/**
 * GET  /api/school/users  → Lista usuarios del colegio (OWNER, ADMIN, SUPER_ADMIN)
 * POST /api/school/users  → Crea un usuario interno (OWNER/ADMIN)
 *
 * Jerarquía de creación:
 *   OWNER     → puede crear ADMIN, STAFF, VIEWER
 *   ADMIN     → puede crear STAFF, VIEWER
 *   SUPER_ADMIN → puede crear cualquier rol (excepto SUPER_ADMIN, que solo se crea via script)
 */

import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  requireOwnerOrAdmin,
  getSessionSchoolId,
  canActorCreateRole,
  appendAuditLog,
} from "@/lib/auth-helpers";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["OWNER", "ADMIN", "STAFF", "VIEWER"], {
    message: "Rol inálido. Valores permitidos: ADMIN, STAFF, VIEWER",
  }),
});

// ─── GET /api/school/users ────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await requireOwnerOrAdmin();

    // SUPER_ADMIN sin schoolId: requiere parámetro school (no soportado en este endpoint)
    if (session.role === "SUPER_ADMIN" && !session.schoolId) {
      return NextResponse.json(
        {
          error:
            "Los administradores globales deben usar el panel de administración",
        },
        { status: 400 },
      );
    }

    const schoolId = session.schoolId!;

    const users = await prisma.user.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ users });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    const status =
      message === "No autenticado"
        ? 401
        : message.includes("rol de propietario")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// ─── POST /api/school/users ───────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await requireOwnerOrAdmin();

    // SUPER_ADMIN sin schoolId no puede crear usuarios via este endpoint
    if (session.role === "SUPER_ADMIN" && !session.schoolId) {
      return NextResponse.json(
        {
          error: "Usa el panel de administración para crear usuarios globales",
        },
        { status: 400 },
      );
    }

    const schoolId = session.schoolId ?? (await getSessionSchoolId());

    const body = await request.json();

    // ── Bloquear cualquier intento de crear SUPER_ADMIN via API ──────────
    if (body?.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No se puede crear un SUPER_ADMIN vía API" },
        { status: 403 },
      );
    }

    const data = createUserSchema.parse(body);

    // ── Verificar jerarquía: ¿puede este actor crear este rol? ───────────
    if (!canActorCreateRole(session.role, data.role)) {
      return NextResponse.json(
        {
          error: `Tu rol (${session.role}) no puede crear usuarios con rol ${data.role}`,
        },
        { status: 403 },
      );
    }

    // ── Verificar unicidad de email ──────────────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 },
      );
    }

    // ── Validación: solo puede haber un OWNER por colegio ─────────────────
    if (data.role === "OWNER") {
      const ownerCount = await prisma.user.count({
        where: { schoolId, role: "OWNER" },
      });
      if (ownerCount > 0) {
        return NextResponse.json(
          {
            error:
              "Ya existe un propietario para este colegio. Usa la transferencia de titularidad para cambiar el OWNER.",
          },
          { status: 400 },
        );
      }
    }

    // ── Crear usuario ────────────────────────────────────────────────────
    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        schoolId,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        createdAt: true,
      },
    });

    // ── Audit log ────────────────────────────────────────────────────────
    await appendAuditLog({
      schoolId,
      actorId: session.id,
      actorRole: session.role,
      action: "USER_CREATED",
      entity: "User",
      entityId: user.id,
      metadata: {
        createdEmail: user.email,
        assignedRole: user.role,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
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
        : message.includes("rol de propietario")
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
