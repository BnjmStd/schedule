/**
 * ⏰ CRON JOB: expire-subscriptions
 *
 * Frecuencia recomendada: diaria — ej. "0 3 * * *" (3 AM UTC)
 *
 * Qué hace:
 *   1. Busca SchoolSubscriptions ACTIVE o TRIALING cuyo currentPeriodEnd ya pasó
 *   2. Las marca como EXPIRED
 *   3. Registra cada cambio en SubscriptionHistory
 *   4. Emite un resumen estructurado de la ejecución
 *
 * Idempotente: re-ejecutar produce el mismo resultado.
 *
 * PREPARADO PARA ESCALAR:
 *   Cuando exista Organization, agregar un segundo bloque análogo aquí.
 */

import { prisma } from "@/lib/prisma";
import { recordSubscriptionChange } from "@/lib/billing/subscription";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

// ============================================
// Tipos del resultado del job
// ============================================

export interface ExpireSubscriptionsResult {
  processed: number;
  expired: number;
  skipped: number;
  errors: Array<{ subscriptionId: string; error: string }>;
  durationMs: number;
  ranAt: string;
}

export const JOB_NAME = "expire-subscriptions";

// ============================================
// Lógica principal
// ============================================

export async function run(): Promise<ExpireSubscriptionsResult> {
  const startedAt = Date.now();
  const now = new Date();

  const result: ExpireSubscriptionsResult = {
    processed: 0,
    expired: 0,
    skipped: 0,
    errors: [],
    durationMs: 0,
    ranAt: now.toISOString(),
  };

  console.log(`[${JOB_NAME}] Iniciando — ${now.toISOString()}`);

  const expired = await prisma.schoolSubscription.findMany({
    where: {
      AND: [
        { status: { in: ["ACTIVE", "TRIALING"] as SubscriptionStatus[] } },
        {
          OR: [
            { currentPeriodEnd: { lt: now } },
            {
              status: "TRIALING" as SubscriptionStatus,
              trialEndsAt: { lt: now },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      schoolId: true,
      plan: true,
      status: true,
      currentPeriodEnd: true,
      trialEndsAt: true,
    },
  });

  result.processed = expired.length;
  console.log(`[${JOB_NAME}] Suscripciones a expirar: ${expired.length}`);

  if (expired.length === 0) {
    result.durationMs = Date.now() - startedAt;
    console.log(
      `[${JOB_NAME}] Nada que procesar. Duración: ${result.durationMs}ms`,
    );
    return result;
  }

  for (const sub of expired) {
    try {
      const oldStatus = sub.status;
      const oldPlan = sub.plan;
      const newStatus: SubscriptionStatus = "EXPIRED";
      const reason =
        sub.status === "TRIALING" ? "trial_expired" : "period_expired";

      await prisma.schoolSubscription.update({
        where: { id: sub.id },
        data: { status: newStatus },
      });

      await recordSubscriptionChange(
        sub.id,
        oldPlan,
        oldPlan as SubscriptionPlan,
        oldStatus,
        newStatus,
        reason,
      );

      result.expired++;
      console.log(
        `[${JOB_NAME}] ✅ schoolId=${sub.schoolId} plan=${oldPlan} ${oldStatus}→${newStatus} (${reason})`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      result.errors.push({ subscriptionId: sub.id, error: errorMessage });
      console.error(
        `[${JOB_NAME}] ❌ Error procesando subscriptionId=${sub.id}: ${errorMessage}`,
      );
    }
  }

  result.skipped = result.processed - result.expired - result.errors.length;
  result.durationMs = Date.now() - startedAt;

  console.log(
    `[${JOB_NAME}] Completado — expired=${result.expired} errors=${result.errors.length} durationMs=${result.durationMs}`,
  );

  return result;
}
