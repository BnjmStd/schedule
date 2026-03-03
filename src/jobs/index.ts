/**
 * ⏰ Jobs — carpeta para tareas periódicas y workers
 *
 * Convención de nombres:
 *   src/jobs/
 *     cron/           → Tareas que se ejecutan por horario (cron expressions)
 *     workers/        → Workers que procesan colas (futuro)
 *     shared/         → Utilidades compartidas entre jobs
 *
 * Cada job exporta:
 *   - run(): Promise<JobResult>  — la lógica del job
 *   - JOB_NAME: string           — nombre legible para logs
 *
 * Los jobs son invocables desde:
 *   1. API route /api/cron/<job>  (llamada desde cron externo o Vercel Cron)
 *   2. Directamente en tests o scripts de mantenimiento
 */

export {
  run as runExpireSubscriptions,
  JOB_NAME as EXPIRE_SUBSCRIPTIONS,
} from "./cron/expire-subscriptions";
