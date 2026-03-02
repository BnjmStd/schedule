/**
 * 💰 Admin Pricing Page — Server Component
 *
 * Vista de solo lectura de la configuración de planes.
 * Los valores provienen de src/config/plans.ts (fuente única de verdad).
 * Para cambiar límites: editar plans.ts y redeploy — sin migración de DB.
 */

import { getPlanFeatures, PLAN_LABELS, PLAN_ORDER } from "@/config/plans";
import type { SubscriptionPlan } from "@prisma/client";
import styles from "./page.module.css";

// ── Feature definitions with metadata ────────────────────────

const NUMERIC_FEATURES: Array<{
  key: "maxSchools" | "maxTeachersPerSchool" | "maxCoursesPerSchool" | "maxSubjectsPerSchool";
  label: string;
  icon: string;
  description: string;
}> = [
  {
    key: "maxSchools",
    label: "Colegios",
    icon: "🏫",
    description: "Número máximo de colegios que puede crear el usuario",
  },
  {
    key: "maxTeachersPerSchool",
    label: "Profesores / colegio",
    icon: "👨‍🏫",
    description: "Máximo de profesores por colegio",
  },
  {
    key: "maxCoursesPerSchool",
    label: "Cursos / colegio",
    icon: "📚",
    description: "Máximo de cursos por colegio",
  },
  {
    key: "maxSubjectsPerSchool",
    label: "Asignaturas / colegio",
    icon: "📝",
    description: "Máximo de asignaturas por colegio",
  },
];

const BOOLEAN_FEATURES: Array<{
  key:
    | "autoScheduleGeneration"
    | "advancedConflictDetection"
    | "exportPDF"
    | "exportExcel"
    | "scheduleHistory"
    | "teacherAvailabilityExceptions"
    | "courseSubjectRequirements"
    | "apiAccess"
    | "prioritySupport";
  label: string;
  icon: string;
  description: string;
}> = [
  {
    key: "autoScheduleGeneration",
    label: "Generador automático de horarios",
    icon: "⚡",
    description: "Motor de generación automática con resolución de conflictos",
  },
  {
    key: "advancedConflictDetection",
    label: "Detección avanzada de conflictos",
    icon: "🔍",
    description: "Detección de colisiones cross-colegio para profesores compartidos",
  },
  {
    key: "exportPDF",
    label: "Exportar a PDF",
    icon: "📄",
    description: "Descarga de horarios en formato PDF",
  },
  {
    key: "exportExcel",
    label: "Exportar a Excel / CSV",
    icon: "📊",
    description: "Descarga en formatos Excel y CSV",
  },
  {
    key: "scheduleHistory",
    label: "Historial de horarios",
    icon: "🕐",
    description: "Registro completo de cambios en jornadas",
  },
  {
    key: "teacherAvailabilityExceptions",
    label: "Excepciones de disponibilidad",
    icon: "📅",
    description: "Bloqueos temporales por fecha específica para profesores",
  },
  {
    key: "courseSubjectRequirements",
    label: "Requisitos por asignatura",
    icon: "📋",
    description: "Configuración de horas semanales obligatorias por asignatura",
  },
  {
    key: "apiAccess",
    label: "Acceso a API externa",
    icon: "🔌",
    description: "Integración vía REST API (próximamente)",
  },
  {
    key: "prioritySupport",
    label: "Soporte prioritario",
    icon: "🎯",
    description: "SLA de respuesta en 4h y canal dedicado",
  },
];

// ── Sub-components ────────────────────────────────────────────

function formatLimit(value: number): string {
  if (value === Infinity) return "∞";
  return value.toLocaleString("es-CL");
}

const PLAN_ACCENTS: Record<SubscriptionPlan, string> = {
  FREE: styles.planAccentFree,
  PRO: styles.planAccentPro,
  ENTERPRISE: styles.planAccentEnt,
};

const PLAN_PRICES: Record<SubscriptionPlan, string> = {
  FREE: "Gratis",
  PRO: "$29 / mes",
  ENTERPRISE: "$99 / mes",
};

const PLAN_SUBTITLES: Record<SubscriptionPlan, string> = {
  FREE: "Para empezar",
  PRO: "Para instituciones",
  ENTERPRISE: "Sin límites",
};

// ── Page ──────────────────────────────────────────────────────

export default function AdminPricingPage() {
  const plans = PLAN_ORDER.map((plan) => ({
    plan,
    features: getPlanFeatures(plan),
  }));

  return (
    <div className={styles.page}>
      {/* ── Notice ──────────────────────────────────────────── */}
      <div className={styles.notice} role="note">
        <span className={styles.noticeIcon} aria-hidden="true">ℹ️</span>
        <div>
          <strong>Fuente de verdad:</strong> Estos límites provienen de{" "}
          <code className={styles.code}>src/config/plans.ts</code>. Para
          modificarlos edita ese archivo y redeploy — sin migraciones de DB.
        </div>
      </div>

      {/* ── Plan cards (mobile) ──────────────────────────────── */}
      <div className={styles.mobilePlanCards}>
        {plans.map(({ plan, features }) => (
          <div
            key={plan}
            className={`${styles.planCard} ${PLAN_ACCENTS[plan]}`}
          >
            <div className={styles.planCardHeader}>
              <span className={styles.planName}>{PLAN_LABELS[plan]}</span>
              <span className={styles.planPrice}>{PLAN_PRICES[plan]}</span>
            </div>
            <span className={styles.planSubtitle}>{PLAN_SUBTITLES[plan]}</span>

            {/* Numeric limits */}
            <div className={styles.limitGroup}>
              {NUMERIC_FEATURES.map(({ key, label, icon }) => (
                <div key={key} className={styles.limitRow}>
                  <span className={styles.limitIcon} aria-hidden="true">{icon}</span>
                  <span className={styles.limitLabel}>{label}</span>
                  <span className={styles.limitValue}>{formatLimit(features[key])}</span>
                </div>
              ))}
            </div>

            {/* Boolean features */}
            <div className={styles.featureGroup}>
              {BOOLEAN_FEATURES.map(({ key, label, icon }) => (
                <div
                  key={key}
                  className={`${styles.featureRow} ${features[key] ? styles.featureEnabled : styles.featureDisabled}`}
                >
                  <span className={styles.featureCheck} aria-hidden="true">
                    {features[key] ? "✅" : "—"}
                  </span>
                  <span className={styles.featureLabelMobile}>
                    <span aria-hidden="true">{icon}</span> {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Comparison table (desktop) ───────────────────────── */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.featureCol}>
                  Característica
                </th>
                {plans.map(({ plan }) => (
                  <th key={plan} scope="col" className={`${styles.planCol} ${PLAN_ACCENTS[plan]}`}>
                    <div className={styles.thContent}>
                      <span className={styles.thPlanName}>{PLAN_LABELS[plan]}</span>
                      <span className={styles.thPrice}>{PLAN_PRICES[plan]}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Numeric limits section */}
            <tbody>
              <tr>
                <td colSpan={4} className={styles.sectionLabel}>
                  📦 Límites cuantitativos
                </td>
              </tr>
              {NUMERIC_FEATURES.map(({ key, label, icon, description }) => (
                <tr key={key} className={styles.tableRow}>
                  <td className={styles.featureName}>
                    <span className={styles.featureNameIcon} aria-hidden="true">{icon}</span>
                    <div>
                      <span className={styles.featureNameText}>{label}</span>
                      <span className={styles.featureDesc}>{description}</span>
                    </div>
                  </td>
                  {plans.map(({ plan, features }) => (
                    <td key={plan} className={styles.planValue}>
                      <span className={styles.numericValue}>
                        {formatLimit(features[key])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Boolean features section */}
              <tr>
                <td colSpan={4} className={styles.sectionLabel}>
                  ✨ Funcionalidades
                </td>
              </tr>
              {BOOLEAN_FEATURES.map(({ key, label, icon, description }) => (
                <tr key={key} className={styles.tableRow}>
                  <td className={styles.featureName}>
                    <span className={styles.featureNameIcon} aria-hidden="true">{icon}</span>
                    <div>
                      <span className={styles.featureNameText}>{label}</span>
                      <span className={styles.featureDesc}>{description}</span>
                    </div>
                  </td>
                  {plans.map(({ plan, features }) => (
                    <td key={plan} className={styles.planValue}>
                      {features[key] ? (
                        <span className={styles.checkYes} aria-label="Incluido">✓</span>
                      ) : (
                        <span className={styles.checkNo} aria-label="No incluido">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
