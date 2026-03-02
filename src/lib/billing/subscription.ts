/**
 * 💳 Subscription Service
 *
 * Única fuente de verdad para el estado de suscripción de un usuario.
 * Toda la lógica de acceso debe pasar por aquí — nunca leer
 * UserSubscription directamente desde las acciones de dominio.
 *
 * PREPARADO PARA ESCALAR:
 *   Cuando exista Organization, las funciones recibirán un
 *   `organizationId` y delegarán a la suscripción de la org.
 *   Los callers (server actions) NO deben cambiar su firma.
 */

import { prisma } from "@/lib/prisma";
import type {
  UserSubscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "@prisma/client";
import { getPlanFeatures, type PlanFeatures } from "@/config/plans";

// ============================================
// 🔧 Tipos internos
// ============================================

export interface ActiveSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  features: PlanFeatures;
  /** La suscripción puede crear recursos (no cancelada ni expirada) */
  canCreate: boolean;
  /** El plan real efectivo (TRIALING → PRO features, PAST_DUE → FREE features) */
  effectivePlan: SubscriptionPlan;
  raw: UserSubscription;
}

export interface SubscriptionLimitError {
  code:
    | "LIMIT_SCHOOLS"
    | "LIMIT_TEACHERS"
    | "LIMIT_COURSES"
    | "LIMIT_SUBJECTS"
    | "FEATURE_DISABLED"
    | "SUBSCRIPTION_INACTIVE";
  message: string;
  limit?: number;
  current?: number;
}

// ============================================
// 🛡️ Estrategia de acceso por estado
//
// ACTIVE     → plan completo
// TRIALING   → features del plan (PRO mientras dure el trial)
// PAST_DUE   → degradar a FREE (pago fallido, no bloquear aún)
// CANCELED   → FREE (datos preservados, sin nuevas creaciones de pago)
// EXPIRED    → FREE
// INCOMPLETE → FREE (pago inicial no completado)
// ============================================
function resolveEffectivePlan(sub: UserSubscription): SubscriptionPlan {
  switch (sub.status) {
    case "ACTIVE":
      return sub.plan;
    case "TRIALING": {
      // Si el trial no expiró, usar el plan asociado
      const now = new Date();
      if (sub.trialEndsAt && sub.trialEndsAt > now) return sub.plan;
      return "FREE";
    }
    case "PAST_DUE":
    case "CANCELED":
    case "EXPIRED":
    case "INCOMPLETE":
    default:
      return "FREE";
  }
}

function canCreateResources(status: SubscriptionStatus): boolean {
  return status === "ACTIVE" || status === "TRIALING";
}

// ============================================
// 📖 Queries
// ============================================

/**
 * Obtiene la suscripción activa de un usuario.
 * Si no existe, crea una FREE automáticamente (bootstrapping).
 *
 * Este es el ÚNICO lugar donde se lee UserSubscription.
 */
export async function getUserActiveSubscription(
  userId: string,
): Promise<ActiveSubscription> {
  let sub = await prisma.userSubscription.findUnique({
    where: { userId },
  });

  // Bootstrap: crear suscripción FREE si no existe
  if (!sub) {
    sub = await prisma.userSubscription.create({
      data: {
        userId,
        plan: "FREE",
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        // FREE no tiene período real — se pone un año lejano
        currentPeriodEnd: new Date("2099-12-31"),
      },
    });
  }

  const effectivePlan = resolveEffectivePlan(sub);
  const features = getPlanFeatures(effectivePlan);

  return {
    plan: sub.plan,
    status: sub.status,
    effectivePlan,
    features,
    canCreate: canCreateResources(sub.status),
    raw: sub,
  };
}

// ============================================
// 🎛️ Feature flags
// ============================================

/**
 * Verifica si una feature está habilitada para un usuario.
 * Usar en server actions y API routes, nunca en client components directamente.
 *
 * @example
 *   if (!await isFeatureEnabled(userId, "autoScheduleGeneration")) {
 *     throw new Error("Esta feature requiere plan Pro");
 *   }
 */
export async function isFeatureEnabled(
  userId: string,
  feature: keyof PlanFeatures,
): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  const value = subscription.features[feature];
  // Soporta tanto boolean como number (limit > 0)
  return typeof value === "boolean" ? value : value > 0;
}

// ============================================
// ✅ Validaciones de creación de recursos
// ============================================

/**
 * Valida si el usuario puede crear un nuevo colegio.
 * Lanza SubscriptionLimitError si supera el límite.
 */
export async function validateSchoolCreation(
  userId: string,
): Promise<void> {
  const subscription = await getUserActiveSubscription(userId);

  if (!subscription.canCreate) {
    throw createLimitError({
      code: "SUBSCRIPTION_INACTIVE",
      message:
        "Tu suscripción no está activa. Por favor, revisa tu método de pago.",
    });
  }

  const { maxSchools } = subscription.features;

  if (maxSchools === Infinity) return; // ENTERPRISE: sin límite

  const currentSchoolCount = await prisma.userSchool.count({
    where: { userId },
  });

  if (currentSchoolCount >= maxSchools) {
    throw createLimitError({
      code: "LIMIT_SCHOOLS",
      message: `Tu plan ${subscription.effectivePlan} permite un máximo de ${maxSchools} colegio${maxSchools === 1 ? "" : "s"}. Actualmente tienes ${currentSchoolCount}.`,
      limit: maxSchools,
      current: currentSchoolCount,
    });
  }
}

/**
 * Valida si el usuario puede crear un nuevo profesor en un colegio.
 */
export async function validateTeacherCreation(
  userId: string,
  schoolId: string,
): Promise<void> {
  // Verificar que el usuario tiene acceso a este colegio
  const userSchool = await prisma.userSchool.findUnique({
    where: { userId_schoolId: { userId, schoolId } },
  });
  if (!userSchool) {
    throw createLimitError({
      code: "SUBSCRIPTION_INACTIVE",
      message: "No tienes acceso a este colegio.",
    });
  }

  const subscription = await getUserActiveSubscription(userId);

  if (!subscription.canCreate) {
    throw createLimitError({
      code: "SUBSCRIPTION_INACTIVE",
      message:
        "Tu suscripción no está activa. Por favor, revisa tu método de pago.",
    });
  }

  const { maxTeachersPerSchool } = subscription.features;

  if (maxTeachersPerSchool === Infinity) return;

  const currentCount = await prisma.teacher.count({ where: { schoolId } });

  if (currentCount >= maxTeachersPerSchool) {
    throw createLimitError({
      code: "LIMIT_TEACHERS",
      message: `Tu plan ${subscription.effectivePlan} permite un máximo de ${maxTeachersPerSchool} profesores por colegio. Actualmente tienes ${currentCount}.`,
      limit: maxTeachersPerSchool,
      current: currentCount,
    });
  }
}

/**
 * Valida si el usuario puede crear un nuevo curso en un colegio.
 */
export async function validateCourseCreation(
  userId: string,
  schoolId: string,
): Promise<void> {
  const subscription = await getUserActiveSubscription(userId);

  if (!subscription.canCreate) {
    throw createLimitError({
      code: "SUBSCRIPTION_INACTIVE",
      message: "Tu suscripción no está activa.",
    });
  }

  const { maxCoursesPerSchool } = subscription.features;

  if (maxCoursesPerSchool === Infinity) return;

  const currentCount = await prisma.course.count({ where: { schoolId } });

  if (currentCount >= maxCoursesPerSchool) {
    throw createLimitError({
      code: "LIMIT_COURSES",
      message: `Tu plan ${subscription.effectivePlan} permite un máximo de ${maxCoursesPerSchool} cursos por colegio. Actualmente tienes ${currentCount}.`,
      limit: maxCoursesPerSchool,
      current: currentCount,
    });
  }
}

/**
 * Valida si un feature específico está disponible para el usuario.
 * Útil para features booleanos (exportPDF, autoScheduleGeneration, etc.)
 */
export async function requireFeature(
  userId: string,
  feature: keyof PlanFeatures,
  featureLabel: string,
): Promise<void> {
  const enabled = await isFeatureEnabled(userId, feature);
  if (!enabled) {
    throw createLimitError({
      code: "FEATURE_DISABLED",
      message: `La función "${featureLabel}" no está disponible en tu plan actual. Actualiza a Pro o Enterprise para acceder.`,
    });
  }
}

// ============================================
// 🔄 Mutaciones
// ============================================

/**
 * Registra un cambio de plan en el historial.
 * Llamar SIEMPRE que cambie plan o status, incluyendo desde webhooks Stripe.
 */
export async function recordSubscriptionChange(
  subscriptionId: string,
  oldPlan: SubscriptionPlan,
  newPlan: SubscriptionPlan,
  oldStatus: SubscriptionStatus,
  newStatus: SubscriptionStatus,
  reason?: string,
): Promise<void> {
  await prisma.subscriptionHistory.create({
    data: {
      subscriptionId,
      oldPlan,
      newPlan,
      oldStatus,
      newStatus,
      reason: reason ?? null,
    },
  });
}

/**
 * Registra un BillingEvent entrante (webhook Stripe).
 * Retorna false si el evento ya fue procesado (idempotencia).
 */
export async function registerBillingEvent(params: {
  stripeEventId: string;
  userId?: string;
  type: string;
  payload: string;
}): Promise<{ created: boolean; eventId: string }> {
  const existing = await prisma.billingEvent.findUnique({
    where: { stripeEventId: params.stripeEventId },
  });

  if (existing) {
    return { created: false, eventId: existing.id };
  }

  const event = await prisma.billingEvent.create({
    data: {
      stripeEventId: params.stripeEventId,
      userId: params.userId ?? null,
      type: params.type,
      payload: params.payload,
      processed: false,
    },
  });

  return { created: true, eventId: event.id };
}

/**
 * Marca un BillingEvent como procesado.
 */
export async function markBillingEventProcessed(
  eventId: string,
  errorMessage?: string,
): Promise<void> {
  await prisma.billingEvent.update({
    where: { id: eventId },
    data: {
      processed: !errorMessage,
      processedAt: new Date(),
      errorMessage: errorMessage ?? null,
    },
  });
}

// ============================================
// 🛠️ Helpers internos
// ============================================

function createLimitError(
  params: SubscriptionLimitError,
): Error & { subscriptionError: SubscriptionLimitError } {
  const err = new Error(params.message) as Error & {
    subscriptionError: SubscriptionLimitError;
  };
  err.subscriptionError = params;
  return err;
}
