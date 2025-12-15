# 🤖 Generación Automática de Horarios - Análisis y Plan de Implementación

> Documento técnico para implementar generación automática de horarios considerando disponibilidad de profesores, conflictos cross-school e historial de disponibilidad.

**Fecha:** Diciembre 15, 2025  
**Estado:** 📋 Planificación

---

## 📊 ANÁLISIS DEL ESTADO ACTUAL

### ✅ Lo que YA existe en el sistema

#### 1. **Modelo de Disponibilidad (`TeacherAvailability`)**

```prisma
model TeacherAvailability {
  id        String   @id @default(cuid())
  teacherId String
  dayOfWeek String   // MONDAY, TUESDAY, etc.
  startTime String   // HH:mm format
  endTime   String   // HH:mm format
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  teacher Teacher @relation(fields: [teacherId], references: [id], onDelete: Cascade)
}
```

**Características:**
- ✅ Almacena horarios disponibles por día
- ✅ Formato de tiempo simple (HH:mm)
- ❌ **No tiene año académico** (problema para historial)

#### 2. **Modelo de Bloques de Horario (`ScheduleBlock`)**

```prisma
model ScheduleBlock {
  id          String   @id @default(cuid())
  scheduleId  String
  courseId    String
  subjectId   String
  teacherId   String   // ✅ Ya tenemos el profesor asignado
  dayOfWeek   String
  blockNumber Int
  startTime   String
  endTime     String
  duration    Int
  classroom   String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  schedule Schedule @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  course   Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  subject  Subject  @relation(fields: [subjectId], references: [id])
  teacher  Teacher  @relation(fields: [teacherId], references: [id])
}
```

**Características:**
- ✅ Vincula profesor, curso, asignatura, horario
- ✅ Tiene relación con Schedule (que tiene academicYear)
- ❌ **No valida conflictos cross-school al guardar**

#### 3. **Validación Actual de Disponibilidad**

**Archivo:** `/src/modules/teachers/actions/index.ts`

```typescript
export async function isTeacherAvailable(
  teacherId: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  // Si no hay teacherId, no hay conflicto
  if (!teacherId) {
    return true;
  }

  // ❌ Solo verifica disponibilidad DECLARADA, no bloques REALES
  const availability = await prisma.teacherAvailability.findMany({
    where: {
      teacherId,
      dayOfWeek
    }
  });

  // Si no tiene configurada disponibilidad, NO está disponible
  if (availability.length === 0) {
    return false;
  }

  // Verificar si el rango solicitado está cubierto
  const hasAvailability = availability.some(slot => {
    return startTime >= slot.startTime && endTime <= slot.endTime;
  });

  return hasAvailability;
}
```

**Problemas:**
1. ❌ **No verifica bloques reales asignados** - Solo mira disponibilidad declarada
2. ❌ **No considera año académico** - Usa la disponibilidad actual sin importar el año
3. ❌ **No valida conflictos cross-school** - Un profesor puede estar en 2 colegios al mismo tiempo

---

## 🎯 OBJETIVOS DEL PROYECTO

### Objetivo Principal
> Implementar un botón que genere horarios automáticamente para cursos considerando:
> 1. Disponibilidad de profesores
> 2. Conflictos de horario (profesor no puede estar en 2 lugares)
> 3. Historial de disponibilidad por año académico

### Objetivos Específicos

1. **✅ Validación Robusta de Conflictos**
   - Verificar disponibilidad declarada
   - Verificar bloques ya asignados
   - Prevenir double-booking cross-school

2. **📅 Historial de Disponibilidad**
   - Disponibilidad versionada por año académico
   - Al generar horarios, siempre usar la más actual
   - Mantener historial para auditoría

3. **🤖 Generación Automática**
   - Algoritmo de asignación inteligente
   - Consideración de restricciones múltiples
   - Optimización de distribución de carga

---

## 🏗️ PLAN DE IMPLEMENTACIÓN

### FASE 1: Fundamentos - Historial y Validación

#### **1.1. Modificar Schema - Agregar Año Académico**

**Archivo:** `prisma/schema.prisma`

```prisma
model TeacherAvailability {
  id           String   @id @default(cuid())
  teacherId    String
  academicYear Int      // ✨ NUEVO: Año académico (2024, 2025, etc.)
  dayOfWeek    String
  startTime    String
  endTime      String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  teacher Teacher @relation(fields: [teacherId], references: [id], onDelete: Cascade)

  @@unique([teacherId, academicYear, dayOfWeek, startTime, endTime]) // ✨ NUEVO
  @@index([teacherId, academicYear]) // ✨ NUEVO: Índice para búsquedas rápidas
  @@map("teacher_availability")
}
```

**Cambios:**
- ➕ Campo `academicYear` (Int, requerido)
- ➕ Unique constraint para evitar duplicados
- ➕ Índice compuesto para optimizar queries

**Migración requerida:**
```bash
npx prisma migrate dev --name add_academic_year_to_teacher_availability
```

---

#### **1.2. Nueva Función: Verificar Conflictos Reales**

**Archivo:** `src/modules/teachers/actions/index.ts`

```typescript
/**
 * Verifica si un profesor YA ESTÁ ASIGNADO en otro horario a la misma hora
 * (Valida conflictos cross-school)
 * @returns true si hay conflicto, false si está libre
 */
export async function hasTeacherScheduleConflict(
  teacherId: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  excludeBlockId?: string, // Para ediciones
  academicYear?: number
): Promise<{
  hasConflict: boolean;
  conflictingBlocks?: Array<{
    courseId: string;
    courseName: string;
    schoolName: string;
    startTime: string;
    endTime: string;
  }>;
}> {
  const year = academicYear || new Date().getFullYear();

  // Buscar bloques existentes del profesor que se solapen
  const conflictingBlocks = await prisma.scheduleBlock.findMany({
    where: {
      teacherId,
      dayOfWeek,
      schedule: {
        academicYear: year,
        isActive: true,
      },
      // Excluir el bloque actual si es edición
      ...(excludeBlockId ? { NOT: { id: excludeBlockId } } : {}),
    },
    include: {
      course: {
        include: {
          school: true,
        },
      },
    },
  });

  // Filtrar bloques que se solapan en tiempo
  const overlapping = conflictingBlocks.filter((block) => {
    return timesOverlap(
      block.startTime,
      block.endTime,
      startTime,
      endTime
    );
  });

  if (overlapping.length === 0) {
    return { hasConflict: false };
  }

  return {
    hasConflict: true,
    conflictingBlocks: overlapping.map((block) => ({
      courseId: block.courseId,
      courseName: block.course.name,
      schoolName: block.course.school.name,
      startTime: block.startTime,
      endTime: block.endTime,
    })),
  };
}

/**
 * Función auxiliar: Verifica si dos rangos de tiempo se solapan
 */
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const [h1, m1] = start1.split(':').map(Number);
  const [h2, m2] = end1.split(':').map(Number);
  const [h3, m3] = start2.split(':').map(Number);
  const [h4, m4] = end2.split(':').map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = h2 * 60 + m2;
  const start2Minutes = h3 * 60 + m3;
  const end2Minutes = h4 * 60 + m4;

  // Hay solapamiento si:
  // - start1 está dentro de [start2, end2)
  // - start2 está dentro de [start1, end1)
  return (
    (start1Minutes >= start2Minutes && start1Minutes < end2Minutes) ||
    (start2Minutes >= start1Minutes && start2Minutes < end1Minutes)
  );
}
```

---

#### **1.3. Actualizar isTeacherAvailable - Usar Año Actual**

**Archivo:** `src/modules/teachers/actions/index.ts`

```typescript
/**
 * Verifica disponibilidad DECLARADA del profesor
 * Ahora usa el año académico actual automáticamente
 */
export async function isTeacherAvailable(
  teacherId: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  academicYear?: number // ✨ NUEVO: Permite especificar año
): Promise<boolean> {
  if (!teacherId) {
    return true;
  }

  const year = academicYear || new Date().getFullYear(); // ✨ Año actual por defecto

  // Obtener disponibilidad para el año específico
  const availability = await prisma.teacherAvailability.findMany({
    where: {
      teacherId,
      academicYear: year, // ✨ NUEVO: Filtrar por año
      dayOfWeek,
    },
  });

  // Si no tiene configurada disponibilidad para este año/día, NO está disponible
  if (availability.length === 0) {
    return false;
  }

  // Verificar si el rango solicitado está cubierto
  const hasAvailability = availability.some((slot) => {
    return startTime >= slot.startTime && endTime <= slot.endTime;
  });

  return hasAvailability;
}
```

---

#### **1.4. Función Completa de Validación**

**Archivo:** `src/modules/teachers/actions/index.ts`

```typescript
/**
 * Validación COMPLETA de disponibilidad del profesor
 * Combina disponibilidad declarada + conflictos reales
 */
export async function validateTeacherSchedule(
  teacherId: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  options?: {
    excludeBlockId?: string;
    academicYear?: number;
  }
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Verificar disponibilidad DECLARADA
  const hasAvailability = await isTeacherAvailable(
    teacherId,
    dayOfWeek,
    startTime,
    endTime,
    options?.academicYear
  );

  if (!hasAvailability) {
    errors.push(
      'El profesor no tiene disponibilidad declarada en este horario'
    );
  }

  // 2. Verificar conflictos REALES (bloques ya asignados)
  const conflictCheck = await hasTeacherScheduleConflict(
    teacherId,
    dayOfWeek,
    startTime,
    endTime,
    options?.excludeBlockId,
    options?.academicYear
  );

  if (conflictCheck.hasConflict) {
    const conflictMessages = conflictCheck.conflictingBlocks!.map(
      (block) =>
        `Ya asignado en ${block.schoolName} - ${block.courseName} (${block.startTime}-${block.endTime})`
    );
    errors.push(...conflictMessages);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

#### **1.5. Integrar Validación en saveSchedule**

**Archivo:** `src/modules/schedules/actions/index.ts`

```typescript
export async function saveSchedule(data: {
  entityId: string;
  entityType: "course" | "teacher";
  blocks: ScheduleBlock[];
}) {
  try {
    const session = await getSession();
    if (!session?.id) {
      throw new Error("No autorizado");
    }

    const { entityId, entityType, blocks } = data;
    
    // ... código existente ...

    const academicYear = new Date().getFullYear();

    // ✨ NUEVA VALIDACIÓN: Verificar conflictos ANTES de guardar
    if (entityType === "course" && courseId) {
      const validationErrors: string[] = [];

      for (const block of blocks) {
        if (!block.teacherId) continue;

        const validation = await validateTeacherSchedule(
          block.teacherId,
          block.day,
          block.startTime,
          block.endTime,
          { academicYear }
        );

        if (!validation.isValid) {
          const teacherInfo = await prisma.teacher.findUnique({
            where: { id: block.teacherId },
          });
          const teacherName = teacherInfo
            ? `${teacherInfo.firstName} ${teacherInfo.lastName}`
            : 'Profesor';

          validationErrors.push(
            `${teacherName} (${block.subject}, ${block.day} ${block.startTime}-${block.endTime}): ${validation.errors.join(', ')}`
          );
        }
      }

      // Si hay errores, no guardar y devolver mensaje
      if (validationErrors.length > 0) {
        throw new Error(
          `No se puede guardar el horario. Conflictos encontrados:\n${validationErrors.join('\n')}`
        );
      }
    }

    // ... resto del código existente para guardar ...
  } catch (error) {
    console.error("Error guardando horario:", error);
    throw error;
  }
}
```

---

### FASE 2: Generación Automática de Horarios

#### **2.1. Definir Restricciones y Configuración**

**Archivo:** `src/modules/schedules/types.ts` (nuevo)

```typescript
/**
 * Configuración para generación automática de horarios
 */
export interface ScheduleGenerationConfig {
  courseId: string;
  academicYear: number;
  
  // Asignaturas requeridas con horas semanales
  subjects: Array<{
    subjectId: string;
    hoursPerWeek: number;
    preferredTeacherId?: string; // Profesor preferido (opcional)
  }>;

  // Restricciones
  constraints?: {
    maxBlocksPerDay?: number; // Máximo bloques por día
    minBreakBetweenBlocks?: number; // Minutos mínimos entre bloques
    preferredDays?: string[]; // Días preferidos para ciertas asignaturas
    avoidConsecutiveBlocks?: boolean; // Evitar bloques consecutivos de la misma asignatura
  };
}

/**
 * Resultado de la generación
 */
export interface ScheduleGenerationResult {
  success: boolean;
  blocks?: ScheduleBlock[];
  errors?: string[];
  warnings?: string[];
  stats?: {
    totalBlocks: number;
    teachersUsed: number;
    coveragePercentage: number; // % de horas requeridas cubiertas
  };
}
```

---

#### **2.2. Algoritmo de Generación - Versión Básica**

**Archivo:** `src/modules/schedules/actions/generation.ts` (nuevo)

```typescript
import { prisma } from "@/lib/prisma";
import { validateTeacherSchedule } from "@/modules/teachers/actions";
import type {
  ScheduleGenerationConfig,
  ScheduleGenerationResult,
} from "../types";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

/**
 * Genera horario automáticamente para un curso
 */
export async function generateScheduleForCourse(
  config: ScheduleGenerationConfig
): Promise<ScheduleGenerationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const generatedBlocks: any[] = [];

  try {
    // 1. Obtener configuración del colegio
    const course = await prisma.course.findUnique({
      where: { id: config.courseId },
      include: { school: true },
    });

    if (!course) {
      throw new Error("Curso no encontrado");
    }

    const schoolConfig = {
      startTime: course.school.scheduleStartTime,
      endTime: course.school.scheduleEndTime,
      blockDuration: course.school.blockDuration,
      lunchBreakConfig: JSON.parse(course.school.lunchBreakConfig),
    };

    // 2. Generar slots de tiempo disponibles
    const timeSlots = generateTimeSlots(schoolConfig);

    // 3. Para cada asignatura, intentar asignar profesores y horarios
    for (const subjectConfig of config.subjects) {
      const subject = await prisma.subject.findUnique({
        where: { id: subjectConfig.subjectId },
      });

      if (!subject) {
        errors.push(`Asignatura ${subjectConfig.subjectId} no encontrada`);
        continue;
      }

      // Obtener profesores que pueden dictar esta asignatura
      const availableTeachers = await prisma.teacher.findMany({
        where: {
          schoolId: course.schoolId,
          teacherSubjects: {
            some: { subjectId: subject.id },
          },
        },
        include: {
          availability: {
            where: { academicYear: config.academicYear },
          },
        },
      });

      if (availableTeachers.length === 0) {
        errors.push(
          `No hay profesores disponibles para ${subject.name}`
        );
        continue;
      }

      // Intentar asignar las horas requeridas
      let hoursAssigned = 0;
      const targetHours = subjectConfig.hoursPerWeek;

      for (const day of DAYS) {
        if (hoursAssigned >= targetHours) break;

        for (const slot of timeSlots) {
          if (hoursAssigned >= targetHours) break;

          // Probar cada profesor hasta encontrar uno disponible
          let assigned = false;
          for (const teacher of availableTeachers) {
            // Validar disponibilidad completa
            const validation = await validateTeacherSchedule(
              teacher.id,
              day,
              slot.startTime,
              slot.endTime,
              { academicYear: config.academicYear }
            );

            if (validation.isValid) {
              // Verificar que el curso también esté libre en ese horario
              const courseIsFree = !generatedBlocks.some(
                (b) =>
                  b.day === day &&
                  timesOverlap(
                    b.startTime,
                    b.endTime,
                    slot.startTime,
                    slot.endTime
                  )
              );

              if (courseIsFree) {
                // ✅ Asignar bloque
                generatedBlocks.push({
                  id: `${Date.now()}-${generatedBlocks.length}`,
                  day,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  subject: subject.name,
                  subjectId: subject.id,
                  teacher: `${teacher.firstName} ${teacher.lastName}`,
                  teacherId: teacher.id,
                  color: subject.color || "#3b82f6",
                });

                hoursAssigned += slot.duration / 60;
                assigned = true;
                break; // Pasar al siguiente slot
              }
            }
          }

          if (!assigned && hoursAssigned < targetHours) {
            warnings.push(
              `No se pudo asignar bloque de ${subject.name} en ${day} ${slot.startTime}`
            );
          }
        }
      }

      if (hoursAssigned < targetHours) {
        warnings.push(
          `Solo se asignaron ${hoursAssigned}/${targetHours} horas de ${subject.name}`
        );
      }
    }

    // 4. Calcular estadísticas
    const totalRequiredHours = config.subjects.reduce(
      (sum, s) => sum + s.hoursPerWeek,
      0
    );
    const totalAssignedHours = generatedBlocks.length;
    const coveragePercentage =
      (totalAssignedHours / totalRequiredHours) * 100;

    const uniqueTeachers = new Set(
      generatedBlocks.map((b) => b.teacherId)
    ).size;

    return {
      success: errors.length === 0,
      blocks: generatedBlocks,
      errors,
      warnings,
      stats: {
        totalBlocks: generatedBlocks.length,
        teachersUsed: uniqueTeachers,
        coveragePercentage: Math.round(coveragePercentage),
      },
    };
  } catch (error) {
    console.error("Error generando horario:", error);
    return {
      success: false,
      errors: [
        error instanceof Error ? error.message : "Error desconocido",
      ],
    };
  }
}

/**
 * Genera slots de tiempo basados en configuración del colegio
 */
function generateTimeSlots(config: {
  startTime: string;
  endTime: string;
  blockDuration: number;
  lunchBreakConfig: Record<string, any>;
}): Array<{ startTime: string; endTime: string; duration: number }> {
  const slots: Array<{
    startTime: string;
    endTime: string;
    duration: number;
  }> = [];
  // ... implementación de generación de slots ...
  // (Similar a la lógica existente en TeacherAvailability.tsx)
  return slots;
}

/**
 * Verifica si dos rangos de tiempo se solapan
 */
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const [h1, m1] = start1.split(":").map(Number);
  const [h2, m2] = end1.split(":").map(Number);
  const [h3, m3] = start2.split(":").map(Number);
  const [h4, m4] = end2.split(":").map(Number);

  const start1Minutes = h1 * 60 + m1;
  const end1Minutes = h2 * 60 + m2;
  const start2Minutes = h3 * 60 + m3;
  const end2Minutes = h4 * 60 + m4;

  return (
    (start1Minutes >= start2Minutes && start1Minutes < end2Minutes) ||
    (start2Minutes >= start1Minutes && start2Minutes < end1Minutes)
  );
}
```

---

#### **2.3. Acción del Servidor**

**Archivo:** `src/modules/schedules/actions/index.ts`

```typescript
/**
 * Genera y guarda horario automáticamente
 */
export async function generateAndSaveSchedule(
  config: ScheduleGenerationConfig
) {
  const session = await getSession();
  if (!session?.id) {
    throw new Error("No autorizado");
  }

  // Verificar acceso al curso
  const course = await prisma.course.findFirst({
    where: {
      id: config.courseId,
      school: {
        users: {
          some: { userId: session.id },
        },
      },
    },
  });

  if (!course) {
    throw new Error("No tienes acceso a este curso");
  }

  // Generar horario
  const result = await generateScheduleForCourse(config);

  if (!result.success) {
    throw new Error(`Error generando horario: ${result.errors?.join(", ")}`);
  }

  // Guardar usando la función existente
  await saveSchedule({
    entityId: config.courseId,
    entityType: "course",
    blocks: result.blocks || [],
  });

  revalidatePath("/schedules");
  return result;
}
```

---

### FASE 3: Interfaz de Usuario

#### **3.1. Modal de Generación Automática**

**Archivo:** `src/modules/schedules/components/GenerateScheduleModal.tsx` (nuevo)

```tsx
"use client";

import { useState } from "react";
import { Modal } from "@/components/ui";
import { generateAndSaveSchedule } from "../actions";
import type { ScheduleGenerationConfig } from "../types";

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  schoolId: string;
}

export function GenerateScheduleModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  schoolId,
}: GenerateScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Array<{
    subjectId: string;
    hoursPerWeek: number;
  }>>([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const config: ScheduleGenerationConfig = {
        courseId,
        academicYear: new Date().getFullYear(),
        subjects,
      };

      const result = await generateAndSaveSchedule(config);

      if (result.success) {
        alert(`✅ Horario generado exitosamente!\n\n` +
          `Bloques creados: ${result.stats?.totalBlocks}\n` +
          `Profesores asignados: ${result.stats?.teachersUsed}\n` +
          `Cobertura: ${result.stats?.coveragePercentage}%`
        );
        onClose();
      } else {
        alert(`⚠️ Generación incompleta:\n${result.warnings?.join('\n')}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🤖 Generar Horario Automáticamente">
      <div style={{ padding: "1rem" }}>
        <p style={{ marginBottom: "1rem" }}>
          Genera un horario automáticamente para <strong>{courseName}</strong> 
          considerando la disponibilidad de profesores y evitando conflictos.
        </p>

        {/* TODO: Formulario para configurar asignaturas y horas */}
        
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
          <button 
            onClick={handleGenerate} 
            disabled={loading || subjects.length === 0}
            style={{
              flex: 1,
              padding: "0.75rem",
              background: "var(--primary-500)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "⏳ Generando..." : "🤖 Generar Horario"}
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

---

#### **3.2. Integrar Botón en Vista de Curso**

**Archivo:** `app/(protected)/courses/page.tsx`

```tsx
// Agregar botón en la página de cursos
<button
  onClick={() => setShowGenerateModal(true)}
  className="btn btn-primary"
>
  🤖 Generar Horario Automáticamente
</button>
```

---

## 📊 RESUMEN DE CAMBIOS

### Base de Datos
- ✅ Agregar `academicYear` a `TeacherAvailability`
- ✅ Índices para optimizar queries

### Backend (Server Actions)
- ✅ `hasTeacherScheduleConflict()` - Validar conflictos cross-school
- ✅ `validateTeacherSchedule()` - Validación completa
- ✅ Actualizar `isTeacherAvailable()` con año académico
- ✅ `generateScheduleForCourse()` - Algoritmo de generación
- ✅ `generateAndSaveSchedule()` - Acción del servidor
- ✅ Integrar validación en `saveSchedule()`

### Frontend (UI)
- ✅ `GenerateScheduleModal` - Modal de configuración
- ✅ Botón en vista de cursos
- ✅ Mensajes de error/éxito detallados

---

## 🚀 PRÓXIMOS PASOS RECOMENDADOS

### Inmediato (MVP)
1. ✅ Ejecutar migración de base de datos
2. ✅ Implementar validación de conflictos
3. ✅ Actualizar `isTeacherAvailable` con año
4. ✅ Integrar validación en `saveSchedule`

### Corto Plazo
5. ✅ Algoritmo básico de generación
6. ✅ UI básica con modal

### Mejoras Futuras
- 🔄 Algoritmo más sofisticado (backtracking, optimización)
- 📊 Visualización de conflictos en tiempo real
- 🎯 Preferencias de profesores
- 📈 Métricas de calidad del horario
- 💾 Guardar múltiples versiones de horarios
- 🔄 Regenerar horario con ajustes

---

## 🎯 DECISIONES TÉCNICAS

### ¿Por qué agregar año académico a disponibilidad?
- ✅ Permite historial de disponibilidad
- ✅ Profesores pueden cambiar disponibilidad cada año
- ✅ Auditoría y trazabilidad

### ¿Por qué validar conflictos antes de guardar?
- ✅ Previene inconsistencias en BD
- ✅ Mejor UX (errores claros antes de guardar)
- ✅ Integridad referencial

### ¿Por qué generar todo antes de guardar?
- ✅ Usuario puede revisar antes de aplicar
- ✅ Permite ajustes manuales
- ✅ Transacción atómica (todo o nada)

---

## 📝 NOTAS FINALES

Este documento sirve como guía completa para implementar la generación automática de horarios. La implementación se hará en fases para mantener el sistema funcional en todo momento.

**Estado actual:** 📋 Documento de planificación completo
**Siguiente paso:** Implementar Fase 1 - Fundamentos
