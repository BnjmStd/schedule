/**
 * 💳 Admin Subscriptions API
 *
 * GET   /api/admin/subscriptions — Lista paginada con filtros
 * PATCH /api/admin/subscriptions — Modificar plan/estado de una suscripción
 *
 * Protegido por middleware (solo admin/super_admin).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, adminErrorResponse } from "@/lib/admin/auth";
import { recordSubscriptionChange } from "@/lib/billing/subscription";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

const VALID_PLANS: SubscriptionPlan[] = ["FREE", "PRO", "ENTERPRISE"];
const VALID_STATUSES: SubscriptionStatus[] = [
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
  "INCOMPLETE",
];

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize") ?? 20)),
    );
    const plan = searchParams.get("plan") as SubscriptionPlan | null;
    const status = searchParams.get("status") as SubscriptionStatus | null;
    const search = searchParams.get("search")?.trim() ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (plan && VALID_PLANS.includes(plan)) {
      where.plan = plan;
    }

    if (status && VALID_STATUSES.includes(status)) {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.userSubscription.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              _count: { select: { schools: true } },
            },
          },
        },
      }),
      prisma.userSubscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions,
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

export async function PATCH(request: NextRequest) {
  try {
    const adminSession = await requireAdminSession();

    const body = await request.json();
    const {
      userId,
      plan,
      status: newStatus,
      reason,
    } = body as {
      userId: string;
      plan?: SubscriptionPlan;
      status?: SubscriptionStatus;
      reason?: string;
    };

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 },
      );
    }

    if (plan && !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    if (newStatus && !VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
    }

    const existing = await prisma.userSubscription.findUnique({
      where: { userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Suscripción no encontrada" },
        { status: 404 },
      );
    }

    const updateData: Partial<{
      plan: SubscriptionPlan;
      status: SubscriptionStatus;
    }> = {};
    if (plan) updateData.plan = plan;
    if (newStatus) updateData.status = newStatus;

    const updated = await prisma.userSubscription.update({
      where: { userId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Registrar cambio en historial (subscriptionId, oldPlan, newPlan, oldStatus, newStatus, reason)
    await recordSubscriptionChange(
      existing.id,
      existing.plan,
      updated.plan,
      existing.status,
      updated.status,
      reason ?? `Actualización manual por admin (${adminSession.email})`,
    );

    return NextResponse.json({ subscription: updated });
  } catch (error) {
    const { body, status } = adminErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
