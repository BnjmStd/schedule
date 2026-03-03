/**
 * 💳 Billing module — public API
 *
 * Importar desde aquí en server actions y API routes:
 *   import { getUserActiveSubscription, validateSchoolCreation } from "@/lib/billing";
 */

export {
  getUserActiveSubscription,
  isFeatureEnabled,
  requireFeature,
  validateSchoolCreation,
  validateTeacherCreation,
  validateCourseCreation,
  recordSubscriptionChange,
  registerBillingEvent,
  markBillingEventProcessed,
} from "./subscription";

export type {
  ActiveSubscription,
  SubscriptionLimitError,
} from "./subscription";

export {
  getPlanFeatures,
  isFeatureInPlan,
  planAtLeast,
  PLAN_LABELS,
  PLAN_ORDER,
} from "@/config/plans";
export type { PlanFeatures } from "@/config/plans";
