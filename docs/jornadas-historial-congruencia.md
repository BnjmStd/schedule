# 📜 Sistema de Historial y Congruencia de Jornadas

## 🎯 Problemas Resueltos

### ❌ Problema 1: Sin Historial de Cambios

**Antes**: Cuando se modificaba una jornada, no había registro del cambio.

**Ahora**: Sistema completo de historial con:

- ✅ Nuevo modelo `ScheduleLevelConfigHistory`
- ✅ Registro automático de cada cambio
- ✅ Información de quién y cuándo cambió
- ✅ Razón del cambio (opcional)

### ❌ Problema 2: Congruencia Débil Curso-Profesor

**Antes**: Un profesor podía tener cursos con jornadas incompatibles sin advertencia.

**Ahora**: Sistema de validación que:

- ✅ Detecta profesores con múltiples niveles académicos
- ✅ Verifica compatibilidad de jornadas
- ✅ Genera reporte de conflictos
- ✅ Función específica `validateScheduleCongruency()`

### ❌ Problema 3: Schedules Obsoletos Sin Tracking

**Antes**: Se marcaban como obsoletos pero sin contexto.

**Ahora**:

- ✅ Campo `configSnapshot` guarda la config original
- ✅ Campo `isDeprecated` marca obsoletos
- ✅ Función para ver compatibilidad: `getScheduleCompatibilityInfo()`
- ✅ Función para restaurar: `restoreSchedule()`

## 📊 Nuevo Modelo de Datos

### ScheduleLevelConfigHistory

```prisma
model ScheduleLevelConfigHistory {
  id            String   @id @default(cuid())
  configId      String   // Relación con la config actual
  schoolId      String
  academicLevel String

  // Configuración histórica
  startTime     String
  endTime       String
  blockDuration Int
  breaks        String // JSON array

  // Metadata del cambio
  changedBy     String? // userId
  changeReason  String? // "Cambio de horario verano"
  createdAt     DateTime @default(now())
}
```

## 🔧 Nuevas Funciones

### 1. Guardar Historial Automáticamente

```typescript
// En saveScheduleConfigForLevel
if (previousConfig && hasCriticalChanges) {
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
}
```

### 2. Obtener Historial

```typescript
const history = await getScheduleConfigHistory(
  schoolId,
  'BASIC',
  10 // últimos 10 cambios
);

// Resultado:
[
  {
    startTime: '08:00',
    endTime: '17:00',
    blockDuration: 45,
    breaks: [...],
    changedBy: 'user-id',
    changeReason: 'Cambio horario verano',
    changedAt: Date
  },
  ...
]
```

### 3. Validar Congruencia

```typescript
const validation = await validateScheduleCongruency(schoolId);

// Resultado:
{
  isValid: false,
  issuesCount: 2,
  issues: [
    {
      type: 'teacher',
      entityId: 'teacher-123',
      entityName: 'Juan Pérez',
      issue: 'Profesor asignado a cursos con jornadas incompatibles',
      details: {
        levels: ['BASIC', 'MIDDLE'],
        configs: [
          { level: 'BASIC', startTime: '08:00', endTime: '17:00' },
          { level: 'MIDDLE', startTime: '08:30', endTime: '18:00' }
        ]
      }
    }
  ]
}
```

## 🧪 Test de Congruencia

### Ejecutar Test

```bash
npm run test:congruency
```

### Qué Verifica

1. ✅ **Configuraciones de jornada**: Lista todas las configs del colegio
2. ✅ **Historial de cambios**: Muestra últimos 5 cambios
3. ✅ **Congruencia curso-profesor**: Detecta conflictos
4. ✅ **Schedules obsoletos**: Cuenta cuántos necesitan actualización

### Ejemplo de Output

```
╔═══════════════════════════════════════════════════╗
║  Test: Congruencia de Jornadas Curso-Profesor    ║
╚═══════════════════════════════════════════════════╝

🏫 Escuela: Colegio San José

📋 Test 1: Configuraciones de Jornada
Configuraciones encontradas: 2
  ✓ BASIC: 08:00 - 17:00 (bloques de 45 min)
  ✓ MIDDLE: 08:00 - 18:00 (bloques de 90 min)

📋 Test 2: Historial de Cambios
Historial encontrado: 3 cambios
  1. 2026-02-10 - 08:00 - 16:30
     Razón: Ajuste horario invierno
  2. 2026-01-15 - 08:00 - 17:30
     Razón: Extensión jornada
  3. 2025-12-01 - 08:30 - 17:00

📋 Test 3: Congruencia Curso-Profesor
Profesores encontrados: 15

  ⚠️  María González
     Asignado a 2 niveles diferentes:
       - BASIC: 2 cursos
          • 1° Básico A
          • 2° Básico B
       - MIDDLE: 1 cursos
          • 3° Medio A
     ❌ CONFLICTO: Jornadas incompatibles
       BASIC: 08:00 - 17:00
       MIDDLE: 08:00 - 18:00

  ✗ 1 conflictos encontrados

📋 Test 4: Schedules Obsoletos
Schedules obsoletos: 3/20
  ⚠️  Hay 3 horarios que necesitan actualización
     - 1° Básico A (BASIC)
     - 2° Básico B (BASIC)
     - 3° Medio A (MIDDLE)

╔═══════════════════════════════════════════════════╗
║                 RESUMEN                           ║
╚═══════════════════════════════════════════════════╝
Configuraciones: 2
Profesores: 15
Schedules activos: 20
Schedules obsoletos: 3
Conflictos encontrados: 1
```

## 🔄 Flujo de Trabajo

### 1. Usuario Modifica Jornada

```typescript
await saveScheduleConfigForLevel(
  {
    schoolId,
    academicLevel: 'BASIC',
    startTime: '08:00',
    endTime: '16:30', // Cambió de 17:00
    blockDuration: 45,
    breaks: [...]
  },
  "Horario reducido por invierno" // ← Razón del cambio
);
```

### 2. Sistema Automáticamente

- ✅ Guarda config anterior en `ScheduleLevelConfigHistory`
- ✅ Marca schedules afectados como `isDeprecated`
- ✅ Registra quién hizo el cambio
- ✅ Log en consola del cambio

### 3. Validación de Congruencia

```typescript
// Ejecutar periódicamente o antes de generar horarios
const validation = await validateScheduleCongruency(schoolId);

if (!validation.isValid) {
  // Mostrar advertencia al usuario
  console.warn(`⚠️  ${validation.issuesCount} conflictos encontrados`);
  validation.issues.forEach((issue) => {
    console.log(`  - ${issue.entityName}: ${issue.issue}`);
  });
}
```

## 📈 Mejoras Implementadas

### En `schedule-config.ts`

- ✅ `getScheduleConfigHistory()` - Ver historial
- ✅ `validateScheduleCongruency()` - Validar conflictos
- ✅ `saveScheduleConfigForLevel()` - Guarda historial automáticamente

### En Base de Datos

- ✅ Nueva tabla `schedule_level_config_history`
- ✅ Relación uno-a-muchos con `schedule_level_configs`
- ✅ Índices optimizados para consultas

### En Tests

- ✅ `test/congruency-validation.test.ts` - Test completo
- ✅ Verifica configuraciones, historial y conflictos
- ✅ Output visual con colores

## 🚀 Uso en Producción

### Dashboard de Admin

```tsx
// Mostrar historial de cambios
const history = await getScheduleConfigHistory(schoolId, "BASIC", 5);

return (
  <div>
    <h3>Últimos Cambios</h3>
    {history.map((h) => (
      <div key={h.id}>
        <span>{h.changedAt.toLocaleDateString()}</span>
        <span>
          {h.startTime} - {h.endTime}
        </span>
        <span>{h.changeReason}</span>
      </div>
    ))}
  </div>
);
```

### Validación Pre-Generación

```typescript
// Antes de generar horarios automáticos
const validation = await validateScheduleCongruency(schoolId);

if (!validation.isValid) {
  return {
    success: false,
    error: "No se puede generar horarios con conflictos de jornada",
    details: validation.issues,
  };
}

// Continuar con generación
await generateAndSaveSchedule(config);
```

## ✅ Checklist de Implementación

- [x] Crear modelo `ScheduleLevelConfigHistory`
- [x] Modificar `saveScheduleConfigForLevel` para guardar historial
- [x] Agregar función `getScheduleConfigHistory`
- [x] Agregar función `validateScheduleCongruency`
- [x] Crear test de congruencia
- [x] Actualizar schema de Prisma
- [x] Aplicar migración a BD
- [x] Regenerar cliente Prisma
- [x] Documentación completa

## 🎯 Próximos Pasos Recomendados

1. **UI para Historial**: Crear página para ver historial visual
2. **Notificaciones**: Alertar cuando hay conflictos
3. **Auto-fix**: Sugerir soluciones a conflictos
4. **Reportes**: Dashboard con métricas de congruencia
5. **Rollback**: Función para volver a config anterior
