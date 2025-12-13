# 📊 Sistema de Selección de Datos Reales - Editor de Horarios

## 🎯 Descripción General

El editor de horarios ahora carga y utiliza **datos reales** de la base de datos para crear bloques de horario, permitiendo seleccionar asignaturas, profesores y cursos existentes en lugar de escribirlos manualmente.

## ✨ Características Implementadas

### 1. **Carga Automática de Datos**
Al abrir el editor, se cargan automáticamente:
- 📚 **Asignaturas**: Todas las asignaturas del colegio con sus códigos y colores
- 👨‍🏫 **Profesores**: Todos los profesores con sus nombres y especializaciones
- 🎓 **Cursos**: Todos los cursos con cantidad de estudiantes

### 2. **Selectores Inteligentes**

#### Selector de Asignaturas
```typescript
<select value={newBlock.subjectId}>
  <option value="">Selecciona una asignatura</option>
  <option value="subj-123">Matemáticas (MAT101)</option>
  <option value="subj-456">Historia (HIS201)</option>
  // ... más asignaturas
</select>
```

**Muestra:**
- Nombre de la asignatura
- Código entre paréntesis
- Color automático según la asignatura

#### Selector de Profesores (para cursos)
```typescript
<select value={newBlock.detailId}>
  <option value="">Selecciona un profesor</option>
  <option value="teach-123">María González - Matemáticas</option>
  <option value="teach-456">Juan Pérez - Historia</option>
  // ... más profesores
</select>
```

**Muestra:**
- Nombre completo del profesor
- Especialización (si está disponible)

#### Selector de Cursos (para profesores)
```typescript
<select value={newBlock.detailId}>
  <option value="">Selecciona un curso</option>
  <option value="course-123">5° Básico A - 30 estudiantes</option>
  <option value="course-456">6° Básico B - 28 estudiantes</option>
  // ... más cursos
</select>
```

**Muestra:**
- Nombre del curso
- Cantidad de estudiantes

### 3. **Color Automático por Asignatura**

Cuando se selecciona una asignatura:
- ✅ El color se asigna **automáticamente** según el color de la asignatura
- 🎨 Muestra un **badge visual** con el nombre y color de la asignatura
- 📝 Indica que "El color se asigna automáticamente según la asignatura"

**Antes de seleccionar asignatura:**
```
┌─────────────────────────────────┐
│ Color                           │
│ ● ● ● ● ● ● ● ● ● ●            │
│ (Selector de colores manual)   │
└─────────────────────────────────┘
```

**Después de seleccionar asignatura:**
```
┌─────────────────────────────────┐
│ Color (color de la asignatura) │
│ ┌───────────────────────────┐  │
│ │   Matemáticas   │  (Azul) │  │
│ └───────────────────────────┘  │
│ El color se asigna             │
│ automáticamente                │
└─────────────────────────────────┘
```

## 🏗️ Arquitectura Técnica

### Estados Agregados

```typescript
// Estados para datos reales
const [subjects, setSubjects] = useState<any[]>([]);
const [teachers, setTeachers] = useState<any[]>([]);
const [courses, setCourses] = useState<any[]>([]);
const [loadingData, setLoadingData] = useState(true);

// Estado del formulario actualizado
const [newBlock, setNewBlock] = useState({
  day: 'MONDAY',
  startTime: '09:00',
  endTime: '10:00',
  subject: '',        // Nombre de la asignatura
  subjectId: '',      // ID de la asignatura ✨ NUEVO
  detail: '',         // Nombre del profesor/curso
  detailId: '',       // ID del profesor/curso ✨ NUEVO
  color: PREDEFINED_COLORS[0]
});
```

### Flujo de Carga de Datos

```
┌─────────────────┐
│ Componente      │
│ monta           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useEffect()     │
│ loadData()      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Promise.all([              │
│   getSubjects(),           │
│   getTeachers(),           │
│   getCourses()             │
│ ])                         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────┐
│ Datos cargados  │
│ en estado       │
└─────────────────┘
```

### Proceso de Creación de Bloque

```
1. Usuario abre modal "Agregar Bloque"
   ↓
2. Selecciona asignatura del dropdown
   → Se actualiza: subjectId, subject, color
   ↓
3. Selecciona profesor/curso del dropdown
   → Se actualiza: detailId, detail
   ↓
4. Completa horarios y día
   ↓
5. Click en "Agregar"
   ↓
6. handleAddBlock()
   → Busca datos completos por IDs
   → Crea bloque con nombres reales y color
   → Agrega a la lista de bloques
   ↓
7. Guardado automático (2 segundos)
   → saveSchedule() persiste en DB
```

## 📦 Estructura de Datos

### Antes (Entrada Manual)
```typescript
// Usuario escribía texto libre
{
  subject: "Matematicas",  // ❌ Puede tener typos
  teacher: "Maria",        // ❌ Sin apellido
  color: "#B4D7FF"        // ❌ Color arbitrario
}
```

### Ahora (Datos Reales)
```typescript
// Usuario selecciona de datos existentes
{
  subjectId: "clx1234567890",     // ✅ ID real
  subject: "Matemáticas",         // ✅ Nombre correcto
  detailId: "clx0987654321",      // ✅ ID real
  teacher: "María González",      // ✅ Nombre completo
  color: "#4F46E5"               // ✅ Color de la asignatura
}
```

## 🎨 Componentes del Formulario

### 1. Selector de Asignatura

```typescript
<select
  value={newBlock.subjectId}
  onChange={(e) => {
    const selectedSubject = subjects.find(s => s.id === e.target.value);
    setNewBlock({ 
      ...newBlock, 
      subjectId: e.target.value,
      subject: selectedSubject?.name || '',
      color: selectedSubject?.color || newBlock.color  // 🎨 Color automático
    });
  }}
>
  <option value="">Selecciona una asignatura</option>
  {subjects.map(subject => (
    <option key={subject.id} value={subject.id}>
      {subject.name} ({subject.code})
    </option>
  ))}
</select>
```

### 2. Selector de Profesor (si entityType === 'course')

```typescript
<select
  value={newBlock.detailId}
  onChange={(e) => {
    const selectedTeacher = teachers.find(t => t.id === e.target.value);
    setNewBlock({ 
      ...newBlock, 
      detailId: e.target.value,
      detail: selectedTeacher 
        ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` 
        : ''
    });
  }}
>
  <option value="">Selecciona un profesor</option>
  {teachers.map(teacher => (
    <option key={teacher.id} value={teacher.id}>
      {teacher.firstName} {teacher.lastName}
      {teacher.specialization && ` - ${teacher.specialization}`}
    </option>
  ))}
</select>
```

### 3. Selector de Curso (si entityType === 'teacher')

```typescript
<select
  value={newBlock.detailId}
  onChange={(e) => {
    const selectedCourse = courses.find(c => c.id === e.target.value);
    setNewBlock({ 
      ...newBlock, 
      detailId: e.target.value,
      detail: selectedCourse?.name || ''
    });
  }}
>
  <option value="">Selecciona un curso</option>
  {courses.map(course => (
    <option key={course.id} value={course.id}>
      {course.name}
      {course.studentCount && ` - ${course.studentCount} estudiantes`}
    </option>
  ))}
</select>
```

## 🔄 Estados de Carga

### Loading State
```typescript
{loadingData ? (
  <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
    Cargando asignaturas...
  </div>
) : (
  // ... render del select
)}
```

### Empty State
```typescript
{subjects.length === 0 ? (
  <div style={{ padding: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
    No hay asignaturas disponibles
  </div>
) : (
  // ... render del select
)}
```

## 💾 Integración con Guardado

La función `handleAddBlock()` ahora busca los datos completos:

```typescript
const handleAddBlock = () => {
  // Validación
  if (!newBlock.subjectId || !newBlock.detailId) {
    alert('Por favor completa todos los campos');
    return;
  }

  // 🔍 Buscar datos completos por IDs
  const selectedSubject = subjects.find(s => s.id === newBlock.subjectId);
  const subjectName = selectedSubject?.name || newBlock.subject;
  const subjectColor = selectedSubject?.color || newBlock.color;

  let detailName = newBlock.detail;
  if (entityType === 'course') {
    const selectedTeacher = teachers.find(t => t.id === newBlock.detailId);
    detailName = selectedTeacher 
      ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}` 
      : newBlock.detail;
  } else {
    const selectedCourse = courses.find(c => c.id === newBlock.detailId);
    detailName = selectedCourse?.name || newBlock.detail;
  }

  // ✅ Crear bloque con datos reales
  const block: ScheduleBlock = {
    id: `${Date.now()}`,
    day: newBlock.day,
    startTime: newBlock.startTime,
    endTime: newBlock.endTime,
    subject: subjectName,        // Nombre real
    ...(entityType === 'course' 
      ? { teacher: detailName }  // Nombre completo
      : { course: detailName }   // Nombre del curso
    ),
    color: subjectColor          // Color de la asignatura
  };

  setBlocks([...blocks, block]);
  // ... guardado automático
};
```

## 🎯 Ventajas del Sistema

### ✅ Para el Usuario
- 🚫 **Sin errores tipográficos**: Selección de lista, no escritura manual
- 🎨 **Colores consistentes**: Cada asignatura tiene su color definido
- ⚡ **Más rápido**: No necesita escribir, solo seleccionar
- 📊 **Información contextual**: Ve especialización, cantidad de estudiantes, etc.
- 🔍 **Búsqueda fácil**: Los selects nativos permiten búsqueda por teclado

### ✅ Para el Sistema
- 🔗 **Integridad referencial**: Usa IDs reales de la base de datos
- 📈 **Mejor para reportes**: Datos normalizados y consistentes
- 🔄 **Actualizaciones automáticas**: Si cambia el nombre de un profesor, se refleja automáticamente
- 🛡️ **Validación natural**: Solo puede seleccionar lo que existe
- 📊 **Analytics mejorados**: Puede trackear qué asignaturas/profesores son más usados

## 🛠️ Mantenimiento

### Agregar más información en los selectores

```typescript
// Ejemplo: Agregar email del profesor
{teachers.map(teacher => (
  <option key={teacher.id} value={teacher.id}>
    {teacher.firstName} {teacher.lastName}
    {teacher.specialization && ` - ${teacher.specialization}`}
    {teacher.email && ` (${teacher.email})`}  // ✨ NUEVO
  </option>
))}
```

### Filtrar datos por escuela

Si necesitas filtrar solo datos del colegio actual:

```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      setLoadingData(true);
      
      // Obtener schoolId del curso/profesor actual
      const entity = await getEntity(entityId);
      const schoolId = entity.schoolId;
      
      // Cargar datos filtrados
      const [subjectsData, teachersData, coursesData] = await Promise.all([
        getSubjects().then(data => data.filter(s => s.schoolId === schoolId)),
        getTeachers().then(data => data.filter(t => t.schoolId === schoolId)),
        getCourses().then(data => data.filter(c => c.schoolId === schoolId)),
      ]);
      
      setSubjects(subjectsData);
      setTeachers(teachersData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoadingData(false);
    }
  };
  loadData();
}, [entityId]);
```

### Agregar búsqueda en selectores

Para muchos datos, considera usar un componente de autocompletado:

```typescript
// Instalar: npm install react-select
import Select from 'react-select';

<Select
  options={subjects.map(s => ({
    value: s.id,
    label: `${s.name} (${s.code})`,
    color: s.color
  }))}
  onChange={(option) => {
    setNewBlock({
      ...newBlock,
      subjectId: option.value,
      subject: option.label,
      color: option.color
    });
  }}
  placeholder="Buscar asignatura..."
  isSearchable
/>
```

## 📝 Archivos Modificados

### 1. `ScheduleEditor.tsx`
**Cambios principales:**
- Agregados imports: `getSubjects`, `getTeachers`, `getCourses`
- Nuevos estados: `subjects`, `teachers`, `courses`, `loadingData`
- Estado `newBlock` extendido con `subjectId` y `detailId`
- useEffect para cargar datos al montar
- `handleAddBlock()` actualizado para usar datos reales
- Selectores reemplazando inputs de texto
- Vista previa del color de asignatura

### 2. `schedule-editor.css`
**Estilos agregados:**
```css
.schedule-editor-color-preview { /* Contenedor de vista previa */ }
.schedule-editor-color-badge { /* Badge con color de asignatura */ }
```

## 🚀 Próximas Mejoras

### Ideas para el Futuro
- 🔍 **Autocompletado avanzado**: Búsqueda inteligente en selectores
- 🎨 **Editor de colores**: Permitir cambiar color de asignatura desde el formulario
- 📊 **Estadísticas**: Mostrar carga horaria del profesor/curso
- ⚠️ **Validaciones**: Detectar si un profesor ya tiene clase a esa hora
- 🔄 **Sugerencias**: Recomendar profesores según especialización
- 📱 **Vista móvil**: Selectores optimizados para touch

---

**Creado:** Diciembre 13, 2025  
**Última actualización:** Diciembre 13, 2025  
**Versión:** 1.0.0
