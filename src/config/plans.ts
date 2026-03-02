/**
 * 💳 Plan Feature Configuration
 *
 * REGLA: Nunca hardcodear límites en el frontend.
 * Esta es la única fuente de verdad para los límites y features por plan.
 *
 * ⚙️ Para cambiar un límite → editar este archivo y redeploy.
 * No requiere migración de base de datos.
 *
 * PREPARADO PARA ESCALAR:
 *   Cuando exista Organization model, getPlanFeatures() recibirá
 *   el plan de la organización en vez del usuario.
 */

import type { SubscriptionPlan } from "@prisma/client";

// ============================================
// 🏗️ Tipos de features
// ============================================

export interface PlanFeatures {
  // Límites cuantitativos
  maxSchools: number;           // Número máximo de colegios que puede crear el usuario
  maxTeachersPerSchool: number; // Profesores por colegio
  maxCoursesPerSchool: number;  // Cursos por colegio
  maxSubjectsPerSchool: number; // Asignaturas por colegio

  // Feature flags booleanos
  autoScheduleGeneration: boolean;  // Generador automático de horarios
  advancedConflictDetection: boolean; // Detección de colisiones avanzada (cross-school)
  exportPDF: boolean;               // Exportar horarios a PDF
  exportExcel: boolean;             // Exportar horarios a Excel/CSV
  scheduleHistory: boolean;         // Historial de cambios de jornada
  teacherAvailabilityExceptions: boolean; // Excepciones de disponibilidad docente
  courseSubjectRequirements: boolean;     // Requisitos por asignatura (para generador)
  apiAccess: boolean;               // Acceso a API externa (futuro)
  prioritySupport: boolean;         // Soporte prioritario
}

// ============================================
// 📋 Definición de planes
// ============================================

const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    maxSchools: 1,
    maxTeachersPerSchool: 15,
    maxCoursesPerSchool: 10,
    maxSubjectsPerSchool: 10,

    autoScheduleGeneration: false,
    advancedConflictDetection: false,
    exportPDF: false,
    exportExcel: false,
    scheduleHistory: false,
    teacherAvailabilityExceptions: false,
    courseSubjectRequirements: false,
    apiAccess: false,
    prioritySupport: false,
  },

  PRO: {
    maxSchools: 5,
    maxTeachersPerSchool: 100,
    maxCoursesPerSchool: 60,
    maxSubjectsPerSchool: 40,

    autoScheduleGeneration: true,
    advancedConflictDetection: true,
    exportPDF: true,
    exportExcel: true,
    scheduleHistory: true,
    teacherAvailabilityExceptions: true,
    courseSubjectRequirements: true,
    apiAccess: false,
    prioritySupport: false,
  },

  ENTERPRISE: {
    maxSchools: Infinity,
    maxTeachersPerSchool: Infinity,
    maxCoursesPerSchool: Infinity,
    maxSubjectsPerSchool: Infinity,

    autoScheduleGeneration: true,
    advancedConflictDetection: true,
    exportPDF: true,
    exportExcel: true,
    scheduleHistory: true,
    teacherAvailabilityExceptions: true,
    courseSubjectRequirements: true,
    apiAccess: true,
    prioritySupport: true,
  },
};

// ============================================
// 🔧 API pública
// ============================================

/**
 * Retorna el conjunto de features asociados a un plan.
 * Punto central para que todo el código use las mismas reglas.
 *
 * NOTA FUTURA: Cuando exista Organization, este helper
 * recibirá el plan de la organización en vez del usuario.
 */
export function getPlanFeatures(plan: SubscriptionPlan): PlanFeatures {
  return PLAN_FEATURES[plan];
}

/**
 * Retorna true si un feature booleano está habilitado para el plan dado.
 */
export function isFeatureInPlan(
  plan: SubscriptionPlan,
  feature: keyof Pick<
    PlanFeatures,
    | "autoScheduleGeneration"
    | "advancedConflictDetection"
    | "exportPDF"
    | "exportExcel"
    | "scheduleHistory"
    | "teacherAvailabilityExceptions"
    | "courseSubjectRequirements"
    | "apiAccess"
    | "prioritySupport"
  >,
): boolean {
  return PLAN_FEATURES[plan][feature];
}

/**
 * Etiquetas legibles para mostrar en UI.
 */
export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: "Gratis",
  PRO: "Pro",
  ENTERPRISE: "Empresa",
};

export const PLAN_ORDER: SubscriptionPlan[] = ["FREE", "PRO", "ENTERPRISE"];

/** Retorna true si planA es mayor o igual que planB en jerarquía. */
export function planAtLeast(
  planA: SubscriptionPlan,
  planB: SubscriptionPlan,
): boolean {
  return PLAN_ORDER.indexOf(planA) >= PLAN_ORDER.indexOf(planB);
}
