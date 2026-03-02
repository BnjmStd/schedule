/**
 * ⏰ CRON JOB: expire-subscriptions
 *
 * Frecuencia recomendada: diaria — ej. "0 3 * * *" (3 AM UTC)
 *
 * Qué hace:
 *   1. Busca suscripciones ACTIVE o TRIALING cuyo currentPeriodEnd ya pasó
 *   2. Las marca como EXPIRED (o ACTIVE→FREE si el plan era FREE)
 *   3. Registra cada cambio en SubscriptionHistory
 *   4. Emite un resumen estructurado de la ejecución
 *
 * Idempotente: re-ejecutar produce el mismo resultado (ya-expiradas se ignoran).
 *
 * PREPARADO PARA ESCALAR:
 *   Cuando exista Organization, este job también expirará
 *   OrganizationSubscription. Agregar un segundo bloque análogo aquí.
 */

import { prisma } from "@/lib/prisma";
import { recordSubscriptionChange } from "@/lib/billing/subscription";
import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

// ============================================
// Tipos del resultado del job
// ============================================

export interface ExpireSubscriptionsResult {
  /** Cuántas suscripciones se procesaron en total */
  processed: number;
  /** Cuántas se marcaron como EXPIRED */
  expired: number;
  /** Cuántas ya estaban expiradas (skip) */
  skipped: number;
  /** IDs de suscripciones que fallaron y el error */
  errors: Array<{ subscriptionId: string; error: string }>;
  /** Milliseconds que tomó el job */
  durationMs: number;
  /** Timestamp de ejecución */
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

  // 1. Obtener suscripciones vencidas que aún no están marcadas como EXPIRED
  //    Incluimos TRIALING cuyo trialEndsAt ya venció también.
  const expired = await prisma.userSubscription.findMany({
    where: {
      AND: [
        {
          status: {
            in: ["ACTIVE", "TRIALING"] as SubscriptionStatus[],
          },
        },
        {
          OR: [
            // Período de facturación vencido
            { currentPeriodEnd: { lt: now } },
            // Trial terminado (si está TRIALING y trialEndsAt ya pasó)
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
      userId: true,
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
    console.log(`[${JOB_NAME}] Nada que procesar. Duración: ${result.durationMs}ms`);
    return result;
  }

  // 2. Procesar cada suscripción individualmente para aislar fallos
  for (const sub of expired) {
    try {
      const oldStatus = sub.status;
      const oldPlan = sub.plan;
      const newStatus: SubscriptionStatus = "EXPIRED";

      // Determinar la razón del vencimiento
      const reason =
        sub.status === "TRIALING"
          ? "trial_expired"
          : "period_expired";

      // Actualizar en BD — operación atómica
      await prisma.userSubscription.update({
        where: { id: sub.id },
        data: {
          status: newStatus,
          // Al expirar, el plan efectivo es FREE para el servicio,
          // pero conservamos el plan original aquí para el historial.
          // resolveEffectivePlan() en el servicio maneja FREE automáticamente.
        },
      });

      // Registrar en historial (reutilizar el helper del servicio de billing)
      await recordSubscriptionChange(
        sub.id,
        oldPlan,
        oldPlan, // el plan no cambia, solo el status
        oldStatus,
        newStatus,
        reason,
      );

      result.expired++;

      console.log(
        `[${JOB_NAME}] ✅ userId=${sub.userId} plan=${oldPlan} ${oldStatus}→${newStatus} (${reason})`,
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";

      result.errors.push({
        subscriptionId: sub.id,
        error: errorMessage,
      });

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
