/**
 * 🔄 Sistema de compatibilidad de horarios
 *
 * Detecta y maneja horarios obsoletos cuando cambia la configuración de jornada
 */

interface ConfigSnapshot {
  startTime: string;
  endTime: string;
  blockDuration: number;
  academicLevel: string;
}

interface ScheduleCompatibilityResult {
  isCompatible: boolean;
  issues: string[];
  canAutoMigrate: boolean;
  recommendation: "keep" | "migrate" | "recreate" | "archive";
}

/**
 * Compara la configuración actual con el snapshot del horario
 */
export function checkScheduleCompatibility(
  scheduleSnapshot: ConfigSnapshot | null,
  currentConfig: ConfigSnapshot,
): ScheduleCompatibilityResult {
  const issues: string[] = [];
  let canAutoMigrate = true;

  if (!scheduleSnapshot) {
    // Horario creado antes del sistema de tracking
    return {
      isCompatible: false,
      issues: ["Horario creado sin información de configuración"],
      canAutoMigrate: false,
      recommendation: "recreate",
    };
  }

  // Verificar nivel académico
  if (scheduleSnapshot.academicLevel !== currentConfig.academicLevel) {
    issues.push(
      `Nivel académico cambió de ${scheduleSnapshot.academicLevel} a ${currentConfig.academicLevel}`,
    );
    canAutoMigrate = false;
  }

  // Verificar duración de bloques
  if (scheduleSnapshot.blockDuration !== currentConfig.blockDuration) {
    issues.push(
      `Duración de bloques cambió de ${scheduleSnapshot.blockDuration} a ${currentConfig.blockDuration} minutos`,
    );
    canAutoMigrate = false; // Cambio de duración requiere recreación
  }

  // Verificar horarios
  if (scheduleSnapshot.startTime !== currentConfig.startTime) {
    issues.push(
      `Hora de inicio cambió de ${scheduleSnapshot.startTime} a ${currentConfig.startTime}`,
    );
  }

  if (scheduleSnapshot.endTime !== currentConfig.endTime) {
    issues.push(
      `Hora de término cambió de ${scheduleSnapshot.endTime} a ${currentConfig.endTime}`,
    );
  }

  if (issues.length === 0) {
    return {
      isCompatible: true,
      issues: [],
      canAutoMigrate: true,
      recommendation: "keep",
    };
  }

  // Determinar recomendación
  let recommendation: "keep" | "migrate" | "recreate" | "archive" = "recreate";

  if (canAutoMigrate && issues.length <= 2) {
    recommendation = "migrate"; // Solo cambios de horario, se puede migrar
  } else if (issues.length > 2 || !canAutoMigrate) {
    recommendation = "recreate"; // Muchos cambios o cambios críticos
  }

  return {
    isCompatible: false,
    issues,
    canAutoMigrate,
    recommendation,
  };
}

/**
 * Crea un snapshot de configuración
 */
export function createConfigSnapshot(
  startTime: string,
  endTime: string,
  blockDuration: number,
  academicLevel: string,
): string {
  const snapshot: ConfigSnapshot = {
    startTime,
    endTime,
    blockDuration,
    academicLevel,
  };
  return JSON.stringify(snapshot);
}

/**
 * Parsea un snapshot desde JSON
 */
export function parseConfigSnapshot(
  snapshotJson: string | null,
): ConfigSnapshot | null {
  if (!snapshotJson) return null;

  try {
    return JSON.parse(snapshotJson) as ConfigSnapshot;
  } catch {
    return null;
  }
}

/**
 * Calcula bloques disponibles según configuración
 */
export function calculateBlocksForConfig(
  startTime: string,
  endTime: string,
  blockDuration: number,
): number {
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);
  const totalMinutes = endHour * 60 + endMin - (startHour * 60 + startMin);
  return Math.floor(totalMinutes / blockDuration);
}

/**
 * Valida si un bloque está dentro del rango de configuración
 */
export function isBlockInRange(
  blockNumber: number,
  startTime: string,
  endTime: string,
  blockDuration: number,
): boolean {
  const maxBlocks = calculateBlocksForConfig(startTime, endTime, blockDuration);
  return blockNumber > 0 && blockNumber <= maxBlocks;
}

/**
 * Genera mensaje descriptivo de problemas de compatibilidad
 */
export function getCompatibilityMessage(
  result: ScheduleCompatibilityResult,
): string {
  if (result.isCompatible) {
    return "✅ El horario es compatible con la configuración actual";
  }

  let message = "⚠️ Este horario tiene problemas de compatibilidad:\n\n";
  message += result.issues.map((issue) => `• ${issue}`).join("\n");
  message += "\n\n";

  switch (result.recommendation) {
    case "migrate":
      message += "💡 Recomendación: Migrar automáticamente ajustando horarios";
      break;
    case "recreate":
      message += "💡 Recomendación: Recrear el horario desde cero";
      break;
    case "archive":
      message += "💡 Recomendación: Archivar y crear uno nuevo";
      break;
    default:
      message += "💡 Recomendación: Revisar manualmente";
  }

  return message;
}
