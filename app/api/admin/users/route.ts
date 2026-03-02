/**
 * 👥 Admin Users API
 *
 * GET  /api/admin/users — Lista paginada con búsqueda y filtros
 * Protegido por middleware (solo admin/super_admin).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, adminErrorResponse } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 20)));
    const search = searchParams.get("search")?.trim() ?? "";
    const role = searchParams.get("role") ?? "";
    const plan = searchParams.get("plan") ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (plan) {
      where.subscription = { plan };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          subscription: {
            select: {
              plan: true,
              status: true,
              currentPeriodEnd: true,
              trialEndsAt: true,
            },
          },
          _count: {
            select: { schools: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    const { body, status } = adminErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
