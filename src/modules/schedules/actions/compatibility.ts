/**
 * 🔄 Acciones para manejar compatibilidad de horarios
 */

"use server";

import { prisma } from "@/lib/prisma";
import {
  parseConfigSnapshot,
  createConfigSnapshot,
  checkScheduleCompatibility,
} from "@/lib/utils/schedule-compatibility";
import { getSession } from "@/lib/session";
import { getScheduleConfigForLevel } from "@/modules/schools/actions/schedule-config";

/**
 * Marca schedules como obsoletos cuando se modifica una jornada
 */
export async function markSchedulesAsDeprecatedForLevel(
  schoolId: string,
  academicLevel: "BASIC" | "MIDDLE",
) {
  const session = await getSession();
  if (!session?.id) {
    throw new Error("No autenticado");
  }

  // Marcar todos los schedules activos del nivel académico como obsoletos
  const result = await prisma.schedule.updateMany({
    where: {
      school: {
        id: schoolId,
      },
      course: {
        academicLevel,
      },
      isActive: true,
    },
    data: {
      isDeprecated: true,
    },
  });

  return {
    count: result.count,
    message: `${result.count} horarios marcados como obsoletos`,
  };
}

/**
 * Actualiza el snapshot de configuración de un schedule
 */
export async function updateScheduleConfigSnapshot(
  scheduleId: string,
  startTime: string,
  endTime: string,
  blockDuration: number,
  academicLevel: string,
) {
  const snapshot = createConfigSnapshot(
    startTime,
    endTime,
    blockDuration,
    academicLevel,
  );

  await prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      configSnapshot: snapshot,
      isDeprecated: false, // Al actualizar el snapshot, ya no es obsoleto
    },
  });
}

/**
 * Obtiene información de compatibilidad de un schedule
 */
export async function getScheduleCompatibilityInfo(scheduleId: string) {
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: {
      course: true,
    },
  });

  if (!schedule) {
    throw new Error("Schedule no encontrado");
  }

  // Obtener configuración actual del nivel académico
  const currentConfig = await getScheduleConfigForLevel(
    schedule.schoolId,
    schedule.course.academicLevel as "BASIC" | "MIDDLE",
  );

  // Parsear snapshot del schedule
  const scheduleSnapshot = parseConfigSnapshot(
    schedule.configSnapshot as string | null,
  );

  // Si no hay snapshot, probablemente es un schedule viejo
  if (!scheduleSnapshot) {
    return {
      isDeprecated: schedule.isDeprecated,
      hasSnapshot: false,
      compatibility: {
        isCompatible: false,
        issues: ["Schedule creado sin información de configuración"],
        canAutoMigrate: false,
        recommendation: "recreate" as const,
      },
    };
  }

  // Verificar compatibilidad
  const compatibility = checkScheduleCompatibility(scheduleSnapshot, {
    startTime: currentConfig.startTime,
    endTime: currentConfig.endTime,
    blockDuration: currentConfig.blockDuration,
    academicLevel: schedule.course.academicLevel,
  });

  return {
    isDeprecated: schedule.isDeprecated,
    hasSnapshot: true,
    scheduleSnapshot,
    currentConfig: {
      startTime: currentConfig.startTime,
      endTime: currentConfig.endTime,
      blockDuration: currentConfig.blockDuration,
      academicLevel: schedule.course.academicLevel,
    },
    compatibility,
  };
}

/**
 * Restaura un schedule marcándolo como NO obsoleto
 * (Útil si el admin quiere mantenerlo después de revisar)
 */
export async function restoreSchedule(scheduleId: string) {
  const session = await getSession();
  if (!session?.id) {
    throw new Error("No autenticado");
  }

  await prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      isDeprecated: false,
    },
  });

  return { success: true, message: "Horario restaurado" };
}

/**
 * Obtiene estadísticas de schedules obsoletos
 */
export async function getDeprecatedSchedulesStats(schoolId: string) {
  const deprecated = await prisma.schedule.count({
    where: {
      schoolId,
      isDeprecated: true,
      isActive: true,
    },
  });

  const total = await prisma.schedule.count({
    where: {
      schoolId,
      isActive: true,
    },
  });

  return {
    deprecated,
    active: total - deprecated,
    total,
    percentage: total > 0 ? Math.round((deprecated / total) * 100) : 0,
  };
}
