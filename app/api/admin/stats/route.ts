/**
 * 📊 Admin Stats API
 * GET /api/admin/stats
 *
 * Métricas globales para el dashboard de administración.
 * Protegido por middleware (solo admin/super_admin).
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, adminErrorResponse } from "@/lib/admin/auth";

export async function GET() {
  try {
    await requireAdminSession();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersLast30Days,
      subscriptionsByPlan,
      subscriptionsByStatus,
      totalSchools,
      totalTeachers,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),

      prisma.schoolSubscription.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),

      prisma.schoolSubscription.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      prisma.school.count(),

      prisma.teacher.count(),

      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          school: {
            select: {
              id: true,
              name: true,
              subscription: { select: { plan: true, status: true } },
            },
          },
        },
      }),
    ]);

    // Aplanar groupBy results
    const byPlan: Record<string, number> = { FREE: 0, PRO: 0, ENTERPRISE: 0 };
    for (const row of subscriptionsByPlan) {
      byPlan[row.plan] = row._count.plan;
    }

    const byStatus: Record<string, number> = {};
    for (const row of subscriptionsByStatus) {
      byStatus[row.status] = row._count.status;
    }

    // Ingresos estimados (sin Stripe — estimación basada en planes)
    const PRO_PRICE = 29; // USD/mes
    const ENTERPRISE_PRICE = 99;
    const estimatedMRR =
      (byPlan.PRO ?? 0) * PRO_PRICE +
      (byPlan.ENTERPRISE ?? 0) * ENTERPRISE_PRICE;

    return NextResponse.json({
      totalUsers,
      newUsersLast30Days,
      totalSchools,
      totalTeachers,
      estimatedMRR,
      subscriptions: {
        byPlan,
        byStatus,
        active: (byStatus.ACTIVE ?? 0) + (byStatus.TRIALING ?? 0),
        total: totalSchools, // 1 sub per school
      },
      recentUsers,
    });
  } catch (error) {
    const { body, status } = adminErrorResponse(error);
    return NextResponse.json(body, { status });
  }
}
