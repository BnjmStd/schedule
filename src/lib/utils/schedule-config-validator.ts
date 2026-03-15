/**
 * ⚙️ ScheduleConfigValidator
 *
 * Validates and adapts school day configuration changes.
 *
 * Supports two modes:
 *   STRICT   — rejects config changes that would break existing schedules
 *   ADAPTIVE — applies changes and auto-adjusts existing blocks
 */

import type {
  BreakConfig,
  ScheduleLevelConfig,
  TimeSlot,
} from "@/types/schedule-config";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type ValidationMode = "STRICT" | "ADAPTIVE";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DailySlot {
  blockNumber: number | null; // null for break slots
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  type: "block" | "break";
  breakName?: string;
}

/** A scheduled class represented at the service layer */
export interface ScheduleBlockData {
  id: string;
  scheduleId: string;
  dayOfWeek: string;
  blockNumber: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  subjectId: string;
  teacherId: string;
}

export interface AdaptedBlock {
  original: ScheduleBlockData;
  adapted: ScheduleBlockData | null; // null = could not be remapped
  status: "kept" | "shifted" | "invalid";
}

export interface AdaptationResult {
  mode: ValidationMode;
  warnings: string[];
  adaptedBlocks: AdaptedBlock[];
  invalidCount: number;
  shiftedCount: number;
  keptCount: number;
  /** True when at least one block could not be remapped and needs manual review */
  needsReview: boolean;
}

export interface ConflictReport {
  teacherCollisions: Array<{
    teacherId: string;
    dayOfWeek: string;
    blockNumber: number;
    scheduleIds: string[];
  }>;
  subjectDuplications: Array<{
    scheduleId: string;
    subjectId: string;
    blockNumbers: number[];
  }>;
  courseDoubleBookings: Array<{
    scheduleId: string;
    dayOfWeek: string;
    blockNumber: number;
    count: number;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert "HH:mm" to total minutes from midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** Convert total minutes from midnight to "HH:mm" */
function fromMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: calculateDailySlots
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the ordered sequence of time slots (blocks + breaks) for a given
 * ScheduleLevelConfig using the `afterBlock` convention.
 *
 * Example with blockDuration=45, breaks=[{ afterBlock:2, duration:15, name:"Recreo" }]:
 *   Block 1: 08:00–08:45
 *   Block 2: 08:45–09:30
 *   Break  : 09:30–09:45  (Recreo)
 *   Block 3: 09:45–10:30
 *   ...
 */
export function calculateDailySlots(config: ScheduleLevelConfig): DailySlot[] {
  const slots: DailySlot[] = [];
  const dayStart = toMinutes(config.startTime);
  const dayEnd = toMinutes(config.endTime);

  // Build a map: afterBlock → break (sorted by afterBlock ascending)
  const breaksByAfterBlock = new Map<number, BreakConfig>();
  for (const b of config.breaks) {
    breaksByAfterBlock.set(b.afterBlock, b);
  }

  let cursor = dayStart;
  let blockNumber = 0;

  while (cursor + config.blockDuration <= dayEnd) {
    blockNumber++;
    const blockStart = cursor;
    const blockEnd = cursor + config.blockDuration;

    slots.push({
      blockNumber,
      startTime: fromMinutes(blockStart),
      endTime: fromMinutes(blockEnd),
      type: "block",
    });

    cursor = blockEnd;

    // Insert break after this block if one is configured
    const brk = breaksByAfterBlock.get(blockNumber);
    if (brk && cursor + brk.duration <= dayEnd) {
      slots.push({
        blockNumber: null,
        startTime: fromMinutes(cursor),
        endTime: fromMinutes(cursor + brk.duration),
        type: "break",
        breakName: brk.name,
      });
      cursor += brk.duration;
    }
  }

  return slots;
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: validateScheduleConfig
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates a ScheduleLevelConfig against all business rules.
 *
 * Returns { valid, errors, warnings }.
 */
export function validateScheduleConfig(
  config: ScheduleLevelConfig,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const dayStartMin = toMinutes(config.startTime);
  const dayEndMin = toMinutes(config.endTime);

  // ── Rule 1: Time coherence ────────────────────────────────────────────────
  if (dayStartMin >= dayEndMin) {
    errors.push(
      `La hora de inicio (${config.startTime}) debe ser anterior a la hora de fin (${config.endTime}).`,
    );
    // No point continuing without valid bounds
    return { valid: false, errors, warnings };
  }

  // ── Rule 2: blockDuration is multiple of 15 ───────────────────────────────
  if (config.blockDuration % 15 !== 0 || config.blockDuration < 15) {
    errors.push(
      `La duración de bloque (${config.blockDuration} min) debe ser múltiplo de 15.`,
    );
  }

  // ── Rule 3: Break durations are multiples of 15 ───────────────────────────
  for (const brk of config.breaks) {
    if (brk.duration % 15 !== 0 || brk.duration < 15) {
      errors.push(
        `"${brk.name}": duración de recreo (${brk.duration} min) debe ser múltiplo de 15.`,
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // ── Rule 4: Calculate break wall-clock positions and check bounds ─────────
  // We must simulate slot generation to know where each break falls in time
  const dayStart = toMinutes(config.startTime);
  let cursor = dayStart;
  let blockCount = 0;
  const breakTimeRanges: Array<{
    name: string;
    startMin: number;
    endMin: number;
  }> = [];

  // Sort breaks by afterBlock so we can process them in order
  const sortedBreaks = [...config.breaks].sort(
    (a, b) => a.afterBlock - b.afterBlock,
  );

  // Walk through until we run out of day
  let tempBlock = 0;
  let tempCursor = dayStart;
  const breaksEncountered = new Set<number>();

  while (tempCursor + config.blockDuration <= dayEndMin) {
    tempBlock++;
    tempCursor += config.blockDuration;

    const brk = config.breaks.find((b) => b.afterBlock === tempBlock);
    if (brk) {
      breaksEncountered.add(brk.afterBlock);
      const brkStart = tempCursor;
      const brkEnd = tempCursor + brk.duration;

      breakTimeRanges.push({
        name: brk.name,
        startMin: brkStart,
        endMin: brkEnd,
      });

      // Rule: break must not exceed day end
      if (brkEnd > dayEndMin) {
        errors.push(
          `Recreo "${brk.name}" (${fromMinutes(brkStart)}–${fromMinutes(brkEnd)}) excede el fin de jornada (${config.endTime}).`,
        );
      }

      tempCursor = brkEnd;
    }

    blockCount = tempBlock;
  }

  // Warn about breaks that are configured for a block number that never occurs
  for (const brk of config.breaks) {
    if (!breaksEncountered.has(brk.afterBlock)) {
      warnings.push(
        `Recreo "${brk.name}" configurado después del bloque ${brk.afterBlock}, pero la jornada no llega a ese bloque.`,
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // ── Rule 5: Overlapping breaks ────────────────────────────────────────────
  for (let i = 0; i < breakTimeRanges.length; i++) {
    for (let j = i + 1; j < breakTimeRanges.length; j++) {
      const a = breakTimeRanges[i];
      const b = breakTimeRanges[j];
      const overlaps = a.startMin < b.endMin && b.startMin < a.endMin;
      if (overlaps) {
        errors.push(
          `Los recreos "${a.name}" (${fromMinutes(a.startMin)}–${fromMinutes(a.endMin)}) y "${b.name}" (${fromMinutes(b.startMin)}–${fromMinutes(b.endMin)}) se solapan.`,
        );
      }
    }
  }

  // ── Rule 6: Lunch >= 30 minutes ───────────────────────────────────────────
  for (const brk of config.breaks) {
    const isLunch =
      brk.name.toLowerCase().includes("almuerzo") ||
      brk.name.toLowerCase().includes("colación") ||
      brk.name.toLowerCase().includes("lunch");
    if (isLunch && brk.duration < 30) {
      errors.push(
        `"${brk.name}": el almuerzo debe tener al menos 30 minutos (configurado: ${brk.duration} min).`,
      );
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // ── Rule 7: Minimum 4 blocks per day ──────────────────────────────────────
  void cursor; // silence unused var
  const slots = calculateDailySlots(config);
  const totalBlocks = slots.filter((s) => s.type === "block").length;

  if (totalBlocks < 4) {
    errors.push(
      `La jornada produce solo ${totalBlocks} bloque(s), se requieren al menos 4.`,
    );
  } else if (totalBlocks < 6) {
    warnings.push(
      `La jornada produce ${totalBlocks} bloques. Considera ampliar el horario.`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: adaptSchedulesToNewConfig
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Remaps existing schedule blocks to the new time grid.
 *
 * Strategy:
 *   1. Generate the new slot sequence.
 *   2. For each existing block, find the new slot whose startTime is closest
 *      to the block's original startTime.
 *   3. If no slot is within MAX_SHIFT_MINUTES, mark the block as "invalid".
 *
 * ADAPTIVE mode: returns adapted blocks with warnings.
 * STRICT mode:   returns immediately with an error if any block cannot be remapped.
 */
const MAX_SHIFT_MINUTES = 60; // blocks shifting more than this are flagged

export function adaptSchedulesToNewConfig(
  existingBlocks: ScheduleBlockData[],
  oldConfig: ScheduleLevelConfig,
  newConfig: ScheduleLevelConfig,
  mode: ValidationMode = "ADAPTIVE",
): AdaptationResult {
  const warnings: string[] = [];
  const adaptedBlocks: AdaptedBlock[] = [];

  const oldSlots = calculateDailySlots(oldConfig);
  const newSlots = calculateDailySlots(newConfig);
  const newBlockSlots = newSlots.filter((s) => s.type === "block");

  const oldBlockCount = oldSlots.filter((s) => s.type === "block").length;
  const newBlockCount = newBlockSlots.length;

  // ── Pre-flight warnings ───────────────────────────────────────────────────
  if (newBlockCount < oldBlockCount) {
    const removed = oldBlockCount - newBlockCount;
    warnings.push(
      `La nueva configuración elimina ${removed} bloque(s) por día. Los bloques afectados serán marcados como inválidos.`,
    );
  }

  const oldBreakCount = oldConfig.breaks.length;
  const newBreakCount = newConfig.breaks.length;

  if (newBreakCount > oldBreakCount) {
    const added = newBreakCount - oldBreakCount;
    // Estimate blocks affected (any block after the earliest inserted break)
    warnings.push(
      `Se añadieron ${added} recreo(s). Los bloques posteriores se desplazarán en el tiempo.`,
    );
  }

  if (newBreakCount < oldBreakCount) {
    const removed = oldBreakCount - newBreakCount;
    warnings.push(
      `Se eliminaron ${removed} recreo(s). Los bloques posteriores se adelantarán en el tiempo.`,
    );
  }

  if (newConfig.blockDuration !== oldConfig.blockDuration) {
    warnings.push(
      `La duración de bloque cambió de ${oldConfig.blockDuration} min a ${newConfig.blockDuration} min. Todos los bloques serán recalculados.`,
    );
  }

  // ── Per-block remapping ───────────────────────────────────────────────────
  for (const block of existingBlocks) {
    const origStartMin = toMinutes(block.startTime);

    // Find the new block slot whose startTime is closest to this block's original start
    let bestSlot: DailySlot | null = null;
    let bestDiff = Infinity;

    for (const slot of newBlockSlots) {
      const diff = Math.abs(toMinutes(slot.startTime) - origStartMin);
      if (diff < bestDiff) {
        bestDiff = diff;
        bestSlot = slot;
      }
    }

    if (!bestSlot || bestDiff > MAX_SHIFT_MINUTES) {
      if (mode === "STRICT") {
        return {
          mode,
          warnings: [
            `Modo estricto: el bloque #${block.blockNumber} (${block.startTime}–${block.endTime}) no puede remapearse en la nueva configuración.`,
          ],
          adaptedBlocks: [],
          invalidCount: 1,
          shiftedCount: 0,
          keptCount: 0,
          needsReview: true,
        };
      }

      adaptedBlocks.push({
        original: block,
        adapted: null,
        status: "invalid",
      });
      continue;
    }

    const adaptedBlock: ScheduleBlockData = {
      ...block,
      blockNumber: bestSlot.blockNumber!,
      startTime: bestSlot.startTime,
      endTime: bestSlot.endTime,
    };

    const shifted = bestSlot.blockNumber !== block.blockNumber || bestDiff > 0;

    adaptedBlocks.push({
      original: block,
      adapted: adaptedBlock,
      status: shifted ? "shifted" : "kept",
    });
  }

  const invalidCount = adaptedBlocks.filter(
    (b) => b.status === "invalid",
  ).length;
  const shiftedCount = adaptedBlocks.filter(
    (b) => b.status === "shifted",
  ).length;
  const keptCount = adaptedBlocks.filter((b) => b.status === "kept").length;

  if (shiftedCount > 0) {
    warnings.push(
      `${shiftedCount} bloque(s) desplazados al timeslot más cercano.`,
    );
  }
  if (invalidCount > 0) {
    warnings.push(
      `${invalidCount} bloque(s) no pudieron remapearse — requieren revisión manual.`,
    );
  }

  return {
    mode,
    warnings,
    adaptedBlocks,
    invalidCount,
    shiftedCount,
    keptCount,
    needsReview: invalidCount > 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core: detectScheduleConflicts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects teacher collisions, subject duplications, and course double-bookings
 * across a set of schedule blocks.
 */
export function detectScheduleConflicts(
  blocks: ScheduleBlockData[],
): ConflictReport {
  const teacherCollisions: ConflictReport["teacherCollisions"] = [];
  const subjectDuplications: ConflictReport["subjectDuplications"] = [];
  const courseDoubleBookings: ConflictReport["courseDoubleBookings"] = [];

  // ── Teacher collisions: same teacher, same day, same block in different schedules
  const teacherSlotMap = new Map<
    string,
    { scheduleIds: Set<string>; block: ScheduleBlockData }
  >();

  for (const block of blocks) {
    const key = `${block.teacherId}::${block.dayOfWeek}::${block.blockNumber}`;
    if (!teacherSlotMap.has(key)) {
      teacherSlotMap.set(key, { scheduleIds: new Set(), block });
    }
    teacherSlotMap.get(key)!.scheduleIds.add(block.scheduleId);
  }

  for (const [, entry] of teacherSlotMap) {
    if (entry.scheduleIds.size > 1) {
      teacherCollisions.push({
        teacherId: entry.block.teacherId,
        dayOfWeek: entry.block.dayOfWeek,
        blockNumber: entry.block.blockNumber,
        scheduleIds: [...entry.scheduleIds],
      });
    }
  }

  // ── Subject duplications: same subject appears twice in the same block within a schedule
  const subjectBlockMap = new Map<string, number[]>();

  for (const block of blocks) {
    const key = `${block.scheduleId}::${block.subjectId}`;
    if (!subjectBlockMap.has(key)) subjectBlockMap.set(key, []);
    subjectBlockMap.get(key)!.push(block.blockNumber);
  }

  for (const [key, blockNumbers] of subjectBlockMap) {
    const uniqueBlocks = new Set(blockNumbers);
    if (uniqueBlocks.size < blockNumbers.length) {
      const [scheduleId, subjectId] = key.split("::");
      subjectDuplications.push({ scheduleId, subjectId, blockNumbers });
    }
  }

  // ── Course double-bookings: same schedule has two blocks at the same day+slot
  const courseSlotMap = new Map<string, number>();

  for (const block of blocks) {
    const key = `${block.scheduleId}::${block.dayOfWeek}::${block.blockNumber}`;
    courseSlotMap.set(key, (courseSlotMap.get(key) ?? 0) + 1);
  }

  for (const [key, count] of courseSlotMap) {
    if (count > 1) {
      const [scheduleId, dayOfWeek, blockNumber] = key.split("::");
      courseDoubleBookings.push({
        scheduleId,
        dayOfWeek,
        blockNumber: Number(blockNumber),
        count,
      });
    }
  }

  return { teacherCollisions, subjectDuplications, courseDoubleBookings };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience: preflightConfigChange
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One-shot entry point used by the action layer before persisting a config change.
 *
 * Given existing blocks and the proposed new config, returns a unified report
 * covering validation, impact warnings, and (in ADAPTIVE mode) the remapping plan.
 */
export function preflightConfigChange(
  proposed: ScheduleLevelConfig,
  existingBlocks: ScheduleBlockData[],
  currentConfig: ScheduleLevelConfig,
  mode: ValidationMode = "ADAPTIVE",
): {
  validation: ValidationResult;
  adaptation: AdaptationResult | null;
  conflicts: ConflictReport | null;
} {
  const validation = validateScheduleConfig(proposed);

  if (!validation.valid) {
    return { validation, adaptation: null, conflicts: null };
  }

  const adaptation = adaptSchedulesToNewConfig(
    existingBlocks,
    currentConfig,
    proposed,
    mode,
  );

  const adaptedFlatBlocks = adaptation.adaptedBlocks
    .filter((b) => b.adapted !== null)
    .map((b) => b.adapted!);

  const conflicts =
    adaptedFlatBlocks.length > 0
      ? detectScheduleConflicts(adaptedFlatBlocks)
      : null;

  // Merge conflict warnings into adaptation warnings
  if (conflicts) {
    if (conflicts.teacherCollisions.length > 0) {
      adaptation.warnings.push(
        `${conflicts.teacherCollisions.length} colisión(es) de profesor detectadas tras la adaptación.`,
      );
      adaptation.needsReview = true;
    }
    if (conflicts.subjectDuplications.length > 0) {
      adaptation.warnings.push(
        `${conflicts.subjectDuplications.length} asignatura(s) duplicada(s) detectadas.`,
      );
      adaptation.needsReview = true;
    }
    if (conflicts.courseDoubleBookings.length > 0) {
      adaptation.warnings.push(
        `${conflicts.courseDoubleBookings.length} solapamiento(s) de curso detectados.`,
      );
      adaptation.needsReview = true;
    }
  }

  return { validation, adaptation, conflicts };
}
