/**
 * 📊 Utilidades para gestión de horarios
 */

import {
  ScheduleBlock,
  TimeBlock,
  DayOfWeek,
  ScheduleConflict,
  ConflictType,
  Teacher,
  TeacherAvailability,
} from '@/types';

/**
 * Convierte un string de tiempo "HH:mm" a minutos desde medianoche
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Verifica si dos bloques de tiempo se superponen
 */
export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);

  return s1 < e2 && s2 < e1;
}

/**
 * Verifica si un profesor está disponible en un horario específico
 */
export function isTeacherAvailable(
  teacherAvailability: TeacherAvailability[],
  dayOfWeek: DayOfWeek,
  startTime: string,
  endTime: string
): boolean {
  const dayAvailability = teacherAvailability.find(
    (av) => av.dayOfWeek === dayOfWeek
  );

  if (!dayAvailability) return false;

  return dayAvailability.timeSlots.some((slot) =>
    timesOverlap(slot.startTime, slot.endTime, startTime, endTime)
  );
}

/**
 * Detecta conflictos en un bloque de horario
 */
export function detectScheduleConflicts(
  block: ScheduleBlock,
  allBlocks: ScheduleBlock[],
  teacher: Teacher | null
): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  // 1. Verificar doble asignación del profesor
  const teacherConflicts = allBlocks.filter(
    (b) =>
      b.id !== block.id &&
      b.teacherId === block.teacherId &&
      b.dayOfWeek === block.dayOfWeek &&
      timesOverlap(
        b.timeBlock.startTime,
        b.timeBlock.endTime,
        block.timeBlock.startTime,
        block.timeBlock.endTime
      )
  );

  if (teacherConflicts.length > 0) {
    conflicts.push({
      type: ConflictType.TEACHER_DOUBLE_BOOKING,
      message: 'El profesor está asignado a otro curso en este horario',
      blockId: block.id,
      affectedBlocks: teacherConflicts.map((b) => b.id),
      severity: 'error',
    });
  }

  // 2. Verificar disponibilidad del profesor
  if (teacher) {
    const isAvailable = isTeacherAvailable(
      teacher.availability,
      block.dayOfWeek,
      block.timeBlock.startTime,
      block.timeBlock.endTime
    );

    if (!isAvailable) {
      conflicts.push({
        type: ConflictType.TEACHER_UNAVAILABLE,
        message: 'El profesor no está disponible en este horario',
        blockId: block.id,
        severity: 'warning',
      });
    }
  }

  // 3. Verificar conflicto de aula (si se especifica)
  if (block.classroom) {
    const classroomConflicts = allBlocks.filter(
      (b) =>
        b.id !== block.id &&
        b.classroom === block.classroom &&
        b.dayOfWeek === block.dayOfWeek &&
        timesOverlap(
          b.timeBlock.startTime,
          b.timeBlock.endTime,
          block.timeBlock.startTime,
          block.timeBlock.endTime
        )
    );

    if (classroomConflicts.length > 0) {
      conflicts.push({
        type: ConflictType.CLASSROOM_CONFLICT,
        message: 'La sala ya está ocupada en este horario',
        blockId: block.id,
        affectedBlocks: classroomConflicts.map((b) => b.id),
        severity: 'error',
      });
    }
  }

  return conflicts;
}

/**
 * Formatea un tiempo para mostrar (08:00 -> 8:00 AM)
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Genera colores consistentes para asignaturas
 */
const subjectColors = [
  'bg-primary-100 text-primary-800 border-primary-300',
  'bg-secondary-100 text-secondary-800 border-secondary-300',
  'bg-accent-100 text-accent-800 border-accent-300',
  'bg-success-100 text-success-800 border-success-300',
  'bg-warning-100 text-warning-800 border-warning-300',
  'bg-schedule-monday text-blue-800 border-blue-300',
  'bg-schedule-tuesday text-pink-800 border-pink-300',
  'bg-schedule-wednesday text-purple-800 border-purple-300',
  'bg-schedule-thursday text-green-800 border-green-300',
  'bg-schedule-friday text-orange-800 border-orange-300',
];

export function getSubjectColor(subjectId: string): string {
  const hash = subjectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return subjectColors[hash % subjectColors.length];
}
