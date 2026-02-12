/**
 * ⚙️ Schedule Configuration Actions
 * Manejo de configuración de horarios por nivel académico
 */

"use server";

import { prisma } from "@/lib/prisma";
import { getUserSchoolIds } from "@/lib/auth-helpers";
import type {
  ScheduleLevelConfig,
  AcademicLevel,
  BreakConfig,
} from "@/types/schedule-config";
import { markSchedulesAsDeprecatedForLevel } from "@/modules/schedules/actions/compatibility";
import {
  DEFAULT_BASIC_CONFIG,
  DEFAULT_MIDDLE_CONFIG,
} from "@/types/schedule-config";

/**
 * Obtener configuración de horario para un nivel específico
 */
export async function getScheduleConfigForLevel(
  schoolId: string,
  academicLevel: AcademicLevel
): Promise<ScheduleLevelConfig> {
  const schoolIds = await getUserSchoolIds();

  if (!schoolIds.includes(schoolId)) {
    throw new Error("No tienes acceso a este colegio");
  }

  const config = await prisma.scheduleLevelConfig.findUnique({
    where: {
      schoolId_academicLevel: {
        schoolId,
        academicLevel,
      },
    },
  });

  if (!config) {
    // Retornar configuración por defecto
    const defaultConfig =
      academicLevel === "BASIC" ? DEFAULT_BASIC_CONFIG : DEFAULT_MIDDLE_CONFIG;

    return { ...defaultConfig, schoolId };
  }

  // Parsear breaks desde JSON
  const breaks: BreakConfig[] = JSON.parse(config.breaks);

  return {
    id: config.id,
    schoolId: config.schoolId,
    academicLevel: config.academicLevel as AcademicLevel,
    startTime: config.startTime,
    endTime: config.endTime,
    blockDuration: config.blockDuration,
    breaks,
  };
}

/**
 * Crear o actualizar configuración de horario para un nivel
 */
export async function saveScheduleConfigForLevel(
  config: ScheduleLevelConfig,
  changeReason?: string
): Promise<ScheduleLevelConfig> {
  const schoolIds = await getUserSchoolIds();

  if (!schoolIds.includes(config.schoolId)) {
    throw new Error("No tienes acceso a este colegio");
  }

  // Validar que blockDuration sea múltiplo de 15
  if (config.blockDuration % 15 !== 0) {
    throw new Error("La duración de bloques debe ser múltiplo de 15 minutos");
  }

  // Validar que las duraciones de recreos sean múltiplos de 15
  for (const breakConfig of config.breaks) {
    if (breakConfig.duration % 15 !== 0) {
      throw new Error("La duración de recreos debe ser múltiplo de 15 minutos");
    }
  }

  const breaksJson = JSON.stringify(config.breaks);

  // Obtener configuración previa para detectar cambios críticos
  const previousConfig = await prisma.scheduleLevelConfig.findUnique({
    where: {
      schoolId_academicLevel: {
        schoolId: config.schoolId,
        academicLevel: config.academicLevel,
      },
    },
  });

  // Detectar cambios críticos
  const hasCriticalChanges =
    previousConfig &&
    (previousConfig.startTime !== config.startTime ||
      previousConfig.endTime !== config.endTime ||
      previousConfig.blockDuration !== config.blockDuration ||
      previousConfig.breaks !== breaksJson);

  const savedConfig = await prisma.scheduleLevelConfig.upsert({
    where: {
      schoolId_academicLevel: {
        schoolId: config.schoolId,
        academicLevel: config.academicLevel,
      },
    },
    create: {
      schoolId: config.schoolId,
      academicLevel: config.academicLevel,
      startTime: config.startTime,
      endTime: config.endTime,
      blockDuration: config.blockDuration,
      breaks: breaksJson,
    },
    update: {
      startTime: config.startTime,
      endTime: config.endTime,
      blockDuration: config.blockDuration,
      breaks: breaksJson,
    },
  });

  // 🆕 Guardar en historial si hubo cambios
  if (previousConfig && hasCriticalChanges) {
    const session = await prisma.session.findFirst({
      orderBy: { createdAt: "desc" },
      select: { userId: true },
    });

    await prisma.scheduleLevelConfigHistory.create({
      data: {
        configId: savedConfig.id,
        schoolId: previousConfig.schoolId,
        academicLevel: previousConfig.academicLevel,
        startTime: previousConfig.startTime,
        endTime: previousConfig.endTime,
        blockDuration: previousConfig.blockDuration,
        breaks: previousConfig.breaks,
        changedBy: session?.userId,
        changeReason: changeReason || "Actualización de jornada",
      },
    });

    console.log("[Config] 📜 Cambio guardado en historial:", {
      academicLevel: config.academicLevel,
      from: `${previousConfig.startTime}-${previousConfig.endTime}`,
      to: `${config.startTime}-${config.endTime}`,
    });
  }

  // Si hubo cambios críticos, marcar schedules existentes como obsoletos
  if (hasCriticalChanges) {
    await markSchedulesAsDeprecatedForLevel(
      config.schoolId,
      config.academicLevel
    );
  }

  return {
    id: savedConfig.id,
    schoolId: savedConfig.schoolId,
    academicLevel: savedConfig.academicLevel as AcademicLevel,
    startTime: savedConfig.startTime,
    endTime: savedConfig.endTime,
    blockDuration: savedConfig.blockDuration,
    breaks: JSON.parse(savedConfig.breaks),
  };
}

/**
 * Obtener configuración para un curso específico (basado en su nivel)
 */
export async function getScheduleConfigForCourse(
  courseId: string
): Promise<ScheduleLevelConfig> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      schoolId: true,
      academicLevel: true,
    },
  });

  if (!course) {
    throw new Error("Curso no encontrado");
  }

  return getScheduleConfigForLevel(
    course.schoolId,
    course.academicLevel as AcademicLevel
  );
}

/**
 * Obtener configuración para un profesor específico (basado en su colegio)
 * Para profesores, usamos una configuración flexible que cubre todos los niveles
 */
export async function getScheduleConfigForTeacher(
  teacherId: string
): Promise<ScheduleLevelConfig> {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: {
      schoolId: true,
    },
  });

  if (!teacher) {
    throw new Error("Profesor no encontrado");
  }

  // Obtener todas las configuraciones del colegio para usar la más amplia
  const configs = await prisma.scheduleLevelConfig.findMany({
    where: { schoolId: teacher.schoolId },
  });

  if (configs.length === 0) {
    // Si no hay configuraciones, retornar configuración por defecto flexible
    return {
      ...DEFAULT_MIDDLE_CONFIG,
      schoolId: teacher.schoolId,
    };
  }

  // Encontrar la configuración más amplia (horario más largo)
  const configsWithBreaks = configs.map((config) => ({
    id: config.id,
    schoolId: config.schoolId,
    academicLevel: config.academicLevel as AcademicLevel,
    startTime: config.startTime,
    endTime: config.endTime,
    blockDuration: config.blockDuration,
    breaks: JSON.parse(config.breaks),
  }));

  // Ordenar por horario más amplio (inicio más temprano y fin más tardío)
  const sortedConfigs = configsWithBreaks.sort((a, b) => {
    const aStart = parseInt(a.startTime.replace(":", ""));
    const bStart = parseInt(b.startTime.replace(":", ""));
    const aEnd = parseInt(a.endTime.replace(":", ""));
    const bEnd = parseInt(b.endTime.replace(":", ""));
    
    // Preferir inicio más temprano
    if (aStart !== bStart) return aStart - bStart;
    // Si tienen mismo inicio, preferir fin más tardío
    return bEnd - aEnd;
  });

  return sortedConfigs[0];
}

/**
 * Obtener todas las configuraciones de un colegio
 */
export async function getAllScheduleConfigsForSchool(
  schoolId: string
): Promise<ScheduleLevelConfig[]> {
  const schoolIds = await getUserSchoolIds();

  if (!schoolIds.includes(schoolId)) {
    throw new Error("No tienes acceso a este colegio");
  }

  const configs = await prisma.scheduleLevelConfig.findMany({
    where: { schoolId },
  });

  return configs.map((config) => ({
    id: config.id,
    schoolId: config.schoolId,
    academicLevel: config.academicLevel as AcademicLevel,
    startTime: config.startTime,
    endTime: config.endTime,
    blockDuration: config.blockDuration,
    breaks: JSON.parse(config.breaks),
  }));
}
/**
 * 🆕 Obtener historial de cambios de una jornada
 */
export async function getScheduleConfigHistory(
  schoolId: string,
  academicLevel: AcademicLevel,
  limit: number = 10
) {
  const schoolIds = await getUserSchoolIds();

  if (!schoolIds.includes(schoolId)) {
    throw new Error("No tienes acceso a este colegio");
  }

  const config = await prisma.scheduleLevelConfig.findUnique({
    where: {
      schoolId_academicLevel: {
        schoolId,
        academicLevel,
      },
    },
  });

  if (!config) {
    return [];
  }

  const history = await prisma.scheduleLevelConfigHistory.findMany({
    where: { configId: config.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return history.map((h) => ({
    id: h.id,
    startTime: h.startTime,
    endTime: h.endTime,
    blockDuration: h.blockDuration,
    breaks: JSON.parse(h.breaks),
    changedBy: h.changedBy,
    changeReason: h.changeReason,
    changedAt: h.createdAt,
  }));
}

/**
 * 🆕 Validar congruencia de jornadas en el colegio
 * Verifica que los profesores tengan cursos con jornadas compatibles
 */
export async function validateScheduleCongruency(schoolId: string) {
  const schoolIds = await getUserSchoolIds();

  if (!schoolIds.includes(schoolId)) {
    throw new Error("No tienes acceso a este colegio");
  }

  const issues: Array<{
    type: "teacher" | "course";
    entityId: string;
    entityName: string;
    issue: string;
    details: any;
  }> = [];

  // Obtener todos los profesores con sus bloques
  const teachers = await prisma.teacher.findMany({
    where: { schoolId },
    include: {
      scheduleBlocks: {
        include: {
          course: true,
        },
      },
    },
  });

  // Validar cada profesor
  for (const teacher of teachers) {
    const teacherName = `${teacher.firstName} ${teacher.lastName}`;
    
    // Obtener niveles académicos únicos de sus cursos
    const courseLevels = new Set(
      teacher.scheduleBlocks.map((b) => b.course.academicLevel)
    );

    // Si tiene cursos de múltiples niveles, verificar compatibilidad
    if (courseLevels.size > 1) {
      const configs = await prisma.scheduleLevelConfig.findMany({
        where: {
          schoolId,
          academicLevel: { in: Array.from(courseLevels) },
        },
      });

      // Verificar si las jornadas son congruentes
      const startTimes = configs.map((c) => c.startTime);
      const endTimes = configs.map((c) => c.endTime);
      const blockDurations = configs.map((c) => c.blockDuration);

      const hasConflict =
        new Set(startTimes).size > 1 ||
        new Set(endTimes).size > 1 ||
        new Set(blockDurations).size > 1;

      if (hasConflict) {
        issues.push({
          type: "teacher",
          entityId: teacher.id,
          entityName: teacherName,
          issue: "Profesor asignado a cursos con jornadas incompatibles",
          details: {
            levels: Array.from(courseLevels),
            configs: configs.map((c) => ({
              level: c.academicLevel,
              startTime: c.startTime,
              endTime: c.endTime,
              blockDuration: c.blockDuration,
            })),
          },
        });
      }
    }
  }

  return {
    isValid: issues.length === 0,
    issuesCount: issues.length,
    issues,
  };
}