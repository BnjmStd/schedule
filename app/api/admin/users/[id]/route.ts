/**
 * 👤 Admin User Detail API
 *
 * GET   /api/admin/users/[id] — Detalle completo de un usuario
 * PATCH /api/admin/users/[id] — Actualizar rol del usuario
 *
 * Protegido por middleware (solo admin/super_admin).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, adminErrorResponse } from "@/lib/admin/auth";

const ALLOWED_ROLES = ["user", "admin", "super_admin"] as const;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        subscription: true,
        schools: {
          include: {
            school: {
              select: { id: true, name: true, createdAt: true },
            },
          },
        },
        _count: {
          select: { schools: true, sessions: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    const { body, status } = adminErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();

    // Validar campos permitidos
    const allowedFields = ["role"] as const;
    const updates: Record<string, string> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No hay campos válidos para actualizar" },
        { status: 400 },
      );
    }

    // Validar rol si se quiere cambiar
    if (
      updates.role &&
      !ALLOWED_ROLES.includes(updates.role as (typeof ALLOWED_ROLES)[number])
    ) {
      return NextResponse.json(
        {
          error: `Rol inválido. Valores permitidos: ${ALLOWED_ROLES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Solo super_admin puede crear super_admins
    if (updates.role === "super_admin" && session.role !== "super_admin") {
      return NextResponse.json(
        { error: "Solo un super_admin puede asignar el rol super_admin" },
        { status: 403 },
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    const { body, status } = adminErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
