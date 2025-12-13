# 💾 Sistema de Guardado Automático - Editor de Horarios

## 📋 Descripción General

El editor de horarios implementa un sistema de **guardado automático inteligente** que persiste los cambios del usuario en la base de datos sin necesidad de presionar un botón de "Guardar".

## ✨ Características Principales

### 1. **Guardado Automático con Debounce**
- ⏱️ **Debounce de 2 segundos**: El sistema espera 2 segundos después del último cambio antes de guardar
- 🔄 **Detección de cambios**: Solo guarda si hay cambios reales en los bloques
- 🚀 **Optimización**: Cancela guardados pendientes si hay nuevos cambios

### 2. **Feedback Visual en Tiempo Real**
El usuario ve claramente el estado del guardado:

| Estado | Ícono | Color | Descripción |
|--------|-------|-------|-------------|
| **Saving** | 🔄 Spinner | Azul | Guardando en la base de datos |
| **Saved** | ✅ Check | Verde | Guardado exitosamente |
| **Error** | ❌ X | Rojo | Error al guardar |
| **Idle** | - | - | Sin cambios pendientes |

### 3. **Contador de Bloques**
- Muestra la cantidad total de bloques en el horario
- Se actualiza en tiempo real al agregar/eliminar bloques

## 🏗️ Arquitectura Técnica

### Flujo de Guardado

```
Usuario edita → Cambio detectado → Debounce (2s) → Guardado automático → Feedback visual
```

### Componentes Clave

#### 1. **ScheduleEditor.tsx**
```typescript
// Estado del guardado
const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
const lastSavedBlocksRef = useRef<string>('');

// Función de guardado automático con debounce
useEffect(() => {
  const currentBlocksString = JSON.stringify(blocks);
  
  // No guardar si no hay cambios
  if (currentBlocksString === lastSavedBlocksRef.current) {
    return;
  }

  // Limpiar timeout anterior
  if (saveTimeoutRef.current) {
    clearTimeout(saveTimeoutRef.current);
  }

  // Establecer nuevo timeout de 2 segundos
  saveTimeoutRef.current = setTimeout(() => {
    autoSave(blocks);
  }, 2000);

  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  };
}, [blocks, autoSave]);
```

#### 2. **Actions - saveSchedule()**
La función de servidor que persiste los datos:

```typescript
export async function saveSchedule(data: {
  courseId: string;
  entityType: 'course' | 'teacher';
  blocks: ScheduleBlock[];
})
```

**Proceso:**
1. ✅ Valida la sesión del usuario
2. 🔍 Verifica acceso al curso
3. 🗓️ Busca o crea el Schedule activo
4. 🗑️ Elimina bloques anteriores
5. ➕ Crea los nuevos bloques
6. 📚 Crea asignaturas y profesores si no existen
7. ♻️ Revalida el path `/schedules`

## 🎨 Estilos CSS

### Estados del Indicador

```css
/* Guardando (azul con spinner) */
.schedule-save-status.saving {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: #60A5FA;
}

/* Guardado (verde con check) */
.schedule-save-status.saved {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #4ADE80;
  animation: fadeIn 0.3s ease;
}

/* Error (rojo con shake) */
.schedule-save-status.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #F87171;
  animation: shake 0.5s ease;
}
```

## 🔧 Configuración

### Tiempos Configurables

```typescript
// Tiempo de debounce (espera antes de guardar)
const DEBOUNCE_TIME = 2000; // 2 segundos

// Tiempo de visualización del estado "saved"
const SAVED_DISPLAY_TIME = 2000; // 2 segundos

// Tiempo de visualización del estado "error"
const ERROR_DISPLAY_TIME = 3000; // 3 segundos
```

### Modificar Tiempos

Para cambiar los tiempos, edita en `ScheduleEditor.tsx`:

```typescript
// Cambiar debounce
saveTimeoutRef.current = setTimeout(() => {
  autoSave(blocks);
}, 3000); // Ahora espera 3 segundos

// Cambiar tiempo de "saved"
setTimeout(() => {
  setSaveStatus('idle');
}, 5000); // Ahora muestra "guardado" por 5 segundos
```

## 📦 Estructura de Datos

### ScheduleBlock (Frontend)
```typescript
interface ScheduleBlock {
  id: string;           // ID temporal (timestamp)
  day: string;          // MONDAY, TUESDAY, etc.
  startTime: string;    // "09:00"
  endTime: string;      // "10:00"
  subject: string;      // "Matemáticas"
  teacher?: string;     // "María González" (si es curso)
  course?: string;      // "5° Básico A" (si es profesor)
  color: string;        // "#B4D7FF"
}
```

### ScheduleBlock (Base de Datos)
```prisma
model ScheduleBlock {
  id          String   @id @default(cuid())
  scheduleId  String
  courseId    String
  subjectId   String
  teacherId   String
  dayOfWeek   String   // MONDAY, TUESDAY, etc.
  blockNumber Int      // 1, 2, 3, etc.
  startTime   String   // "09:00"
  endTime     String   // "10:00"
  duration    Int      // 60 (minutos)
  classroom   String?
  notes       String?
}
```

## 🚀 Ventajas del Sistema

### ✅ Para el Usuario
- 🎯 **Sin pérdida de datos**: Cada cambio se guarda automáticamente
- 👀 **Feedback claro**: Siempre sabe el estado del guardado
- ⚡ **Experiencia fluida**: No necesita recordar guardar manualmente
- 🔄 **Recuperación automática**: Los datos persisten entre sesiones

### ✅ Para el Desarrollo
- 🏗️ **Arquitectura limpia**: Separación clara entre UI y persistencia
- 🐛 **Fácil debugging**: Estados bien definidos con logs
- 🔒 **Seguro**: Validación de sesión y acceso en servidor
- 📈 **Escalable**: Fácil agregar validaciones o lógica adicional

## 🛠️ Mantenimiento

### Agregar Validaciones

Para agregar validaciones antes de guardar:

```typescript
const autoSave = useCallback(async (blocksToSave: ScheduleBlock[]) => {
  try {
    setSaveStatus('saving');
    
    // ✅ AGREGAR VALIDACIONES AQUÍ
    if (blocksToSave.length === 0) {
      console.log('No hay bloques para guardar');
      setSaveStatus('idle');
      return;
    }
    
    // Validar conflictos de horario
    const hasConflicts = checkScheduleConflicts(blocksToSave);
    if (hasConflicts) {
      throw new Error('Hay conflictos en el horario');
    }
    
    await saveSchedule({
      courseId: entityId,
      entityType,
      blocks: blocksToSave,
    });

    lastSavedBlocksRef.current = JSON.stringify(blocksToSave);
    setSaveStatus('saved');
  } catch (error) {
    console.error('Error guardando:', error);
    setSaveStatus('error');
  }
}, [entityId, entityType]);
```

### Agregar Logs

```typescript
const autoSave = useCallback(async (blocksToSave: ScheduleBlock[]) => {
  try {
    console.log('🔄 Iniciando guardado automático...');
    console.log('📊 Bloques a guardar:', blocksToSave.length);
    
    setSaveStatus('saving');
    
    const result = await saveSchedule({
      courseId: entityId,
      entityType,
      blocks: blocksToSave,
    });

    console.log('✅ Guardado exitoso:', result);
    setSaveStatus('saved');
  } catch (error) {
    console.error('❌ Error en guardado automático:', error);
    setSaveStatus('error');
  }
}, [entityId, entityType]);
```

## 📝 Notas de Implementación

### Creación Automática de Entidades
El sistema **crea automáticamente** asignaturas y profesores si no existen:

```typescript
// Buscar o crear asignatura
let subject = await prisma.subject.findFirst({
  where: { schoolId, name: block.subject }
});

if (!subject) {
  // Crear asignatura automáticamente
  subject = await prisma.subject.create({
    data: {
      schoolId,
      name: block.subject,
      code: generateCode(block.subject),
      color: block.color,
    },
  });
}
```

### Cálculo de Duración
La duración se calcula automáticamente en minutos:

```typescript
const [startHour, startMin] = block.startTime.split(':').map(Number);
const [endHour, endMin] = block.endTime.split(':').map(Number);
const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
```

## 🎯 Próximas Mejoras

### Ideas para el Futuro
- 🔔 Notificaciones toast para errores específicos
- 📡 Guardar sin conexión (offline-first)
- 🔙 Sistema de deshacer/rehacer
- 🔍 Detección de conflictos en tiempo real
- 📊 Historial de versiones del horario
- 🤝 Edición colaborativa en tiempo real

---

**Creado:** Diciembre 2025  
**Última actualización:** Diciembre 13, 2025  
**Versión:** 1.0.0
