# 💡 Ejemplos de Uso del Sistema

Colección de ejemplos prácticos para usar el sistema de gestión de horarios.

## 📋 Ejemplos de Componentes

### Usando Button con diferentes variantes

```tsx
import { Button } from '@/components/ui';

// Botón primario (azul)
<Button variant="primary" size="md">
  Guardar Cambios
</Button>

// Botón de éxito (verde)
<Button variant="success" size="sm">
  Confirmar
</Button>

// Botón de peligro (rojo)
<Button variant="danger" size="lg">
  Eliminar
</Button>

// Botón fantasma (transparente)
<Button variant="ghost">
  Cancelar
</Button>

// Botón con ícono izquierdo
<Button 
  variant="primary"
  leftIcon={<span>📅</span>}
>
  Crear Horario
</Button>

// Botón con estado de carga
<Button 
  variant="primary"
  isLoading={true}
>
  Guardando...
</Button>
```

### Usando Card para mostrar información

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button 
} from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Profesor: María González</CardTitle>
    <CardDescription>
      Especialista en Matemáticas y Física
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    <div className="space-y-2">
      <p className="text-sm text-neutral-600">
        📧 maria.gonzalez@ejemplo.cl
      </p>
      <p className="text-sm text-neutral-600">
        📞 +56 9 1234 5678
      </p>
    </div>
  </CardContent>
  
  <CardFooter>
    <Button variant="primary" size="sm">
      Ver Perfil
    </Button>
  </CardFooter>
</Card>
```

### Usando Badge para estados

```tsx
import { Badge } from '@/components/ui';

// Estados de profesores
<Badge variant="success">Disponible</Badge>
<Badge variant="warning">Ocupado</Badge>
<Badge variant="danger">No Disponible</Badge>

// Estados de horarios
<Badge variant="primary">Activo</Badge>
<Badge variant="neutral">Borrador</Badge>

// Tamaños
<Badge variant="accent" size="sm">Pequeño</Badge>
<Badge variant="accent" size="md">Mediano</Badge>
<Badge variant="accent" size="lg">Grande</Badge>
```

### Formularios con Input y Select

```tsx
'use client';

import { useState } from 'react';
import { Input, Select, Button } from '@/components/ui';

export function CreateTeacherForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialization: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación simple
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Enviar datos...
    console.log('Datos válidos:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre"
        placeholder="Ingrese el nombre"
        value={formData.firstName}
        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
        error={errors.firstName}
        required
      />

      <Input
        label="Apellido"
        placeholder="Ingrese el apellido"
        value={formData.lastName}
        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
        required
      />

      <Input
        type="email"
        label="Email"
        placeholder="ejemplo@correo.cl"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        required
      />

      <Select
        label="Especialización"
        placeholder="Seleccione una especialización"
        value={formData.specialization}
        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
        options={[
          { value: 'matematicas', label: 'Matemáticas' },
          { value: 'ciencias', label: 'Ciencias' },
          { value: 'lenguaje', label: 'Lenguaje' },
          { value: 'historia', label: 'Historia' },
        ]}
      />

      <Button type="submit" variant="primary">
        Crear Profesor
      </Button>
    </form>
  );
}
```

## 🗓️ Ejemplos de ScheduleGrid

### Uso básico

```tsx
import { ScheduleGrid } from '@/modules/schedules/components';
import { DEFAULT_TIME_BLOCKS, DayOfWeek } from '@/types';

// Crear datos de ejemplo
const exampleSchedule = {
  id: '1',
  schoolId: '1',
  courseId: '1',
  name: 'Horario 1° Básico A',
  academicYear: 2025,
  semester: 1,
  startDate: new Date('2025-03-01'),
  endDate: new Date('2025-07-31'),
  isActive: true,
  blocks: [
    {
      id: '1',
      scheduleId: '1',
      courseId: '1',
      subjectId: 'MAT101',
      teacherId: 'teacher-1',
      dayOfWeek: DayOfWeek.MONDAY,
      timeBlock: DEFAULT_TIME_BLOCKS[0],
      classroom: 'Sala 101',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // ... más bloques
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Renderizar la grilla
<ScheduleGrid
  schedule={exampleSchedule}
  timeBlocks={DEFAULT_TIME_BLOCKS}
/>
```

### Con handlers de click

```tsx
'use client';

import { useState } from 'react';
import { ScheduleGrid } from '@/modules/schedules/components';
import { ScheduleBlock, DayOfWeek, TimeBlock } from '@/types';

export function InteractiveSchedule({ schedule }) {
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);

  const handleBlockClick = (
    block: ScheduleBlock | null, 
    day: DayOfWeek, 
    timeBlock: TimeBlock
  ) => {
    if (block) {
      // Editar bloque existente
      console.log('Editar bloque:', block);
      setSelectedBlock(block);
    } else {
      // Crear nuevo bloque
      console.log('Crear bloque en:', day, timeBlock);
      // Abrir modal de creación...
    }
  };

  return (
    <div>
      <ScheduleGrid
        schedule={schedule}
        timeBlocks={DEFAULT_TIME_BLOCKS}
        onBlockClick={handleBlockClick}
        showConflicts={true}
      />

      {selectedBlock && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold">Bloque Seleccionado:</h3>
          <p>Asignatura: {selectedBlock.subjectId}</p>
          <p>Profesor: {selectedBlock.teacherId}</p>
          <p>Aula: {selectedBlock.classroom}</p>
        </div>
      )}
    </div>
  );
}
```

## 🔄 Ejemplos de Server Actions

### Crear un nuevo colegio

```tsx
'use client';

import { useState } from 'react';
import { createSchool } from '@/modules/schools/actions';
import { Button, Input } from '@/components/ui';

export function CreateSchoolButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    
    try {
      const newSchool = await createSchool({
        name: 'Colegio Nuevo',
        address: 'Dirección 123',
        phone: '+56 2 2345 6789',
        email: 'contacto@nuevo.cl',
      });
      
      console.log('Colegio creado:', newSchool);
      alert('¡Colegio creado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el colegio');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="primary" 
      onClick={handleCreate}
      isLoading={isLoading}
    >
      Crear Colegio
    </Button>
  );
}
```

### Listar profesores con filtro

```tsx
import { getTeachers } from '@/modules/teachers/actions';
import { TeacherCard } from '@/modules/teachers/components';

export default async function TeachersPage({ 
  searchParams 
}: { 
  searchParams: { school?: string } 
}) {
  const teachers = await getTeachers();
  
  // Filtrar por colegio si se proporciona
  const filteredTeachers = searchParams.school
    ? teachers.filter(t => t.schoolId === searchParams.school)
    : teachers;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTeachers.map((teacher) => (
        <TeacherCard key={teacher.id} teacher={teacher} />
      ))}
    </div>
  );
}
```

## 🎨 Ejemplos de Layout

### Layout con Sidebar

```tsx
import { Container, PageHeader } from '@/components/layout';
import { Sidebar, SidebarSection, SidebarLink } from '@/components/layout';

export default function LayoutWithSidebar({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarSection title="Gestión">
          <SidebarLink href="/schools" icon="🏫" active>
            Colegios
          </SidebarLink>
          <SidebarLink href="/teachers" icon="👨‍🏫">
            Profesores
          </SidebarLink>
          <SidebarLink href="/subjects" icon="📚">
            Asignaturas
          </SidebarLink>
        </SidebarSection>

        <SidebarSection title="Horarios">
          <SidebarLink href="/schedules" icon="🗓️">
            Ver Horarios
          </SidebarLink>
          <SidebarLink href="/schedules/create" icon="➕">
            Crear Horario
          </SidebarLink>
        </SidebarSection>
      </Sidebar>

      <div className="flex-1">
        <Container>
          {children}
        </Container>
      </div>
    </div>
  );
}
```

### PageHeader con acciones múltiples

```tsx
import { PageHeader } from '@/components/layout';
import { Button } from '@/components/ui';

<PageHeader
  title="Gestión de Horarios"
  description="Administra y visualiza todos los horarios del colegio"
  actions={
    <div className="flex gap-2">
      <Button variant="outline">
        Exportar PDF
      </Button>
      <Button variant="ghost">
        Filtrar
      </Button>
      <Button variant="primary">
        + Nuevo Horario
      </Button>
    </div>
  }
/>
```

## 🔍 Ejemplos de Validación

### Detectar conflictos de horario

```tsx
import { detectScheduleConflicts } from '@/lib/utils/schedule';

// Validar antes de guardar
async function saveScheduleBlock(newBlock: ScheduleBlock) {
  const allBlocks = await getScheduleBlocks(newBlock.scheduleId);
  const teacher = await getTeacher(newBlock.teacherId);
  
  const conflicts = detectScheduleConflicts(newBlock, allBlocks, teacher);
  
  if (conflicts.length > 0) {
    // Mostrar conflictos al usuario
    console.error('Conflictos detectados:', conflicts);
    
    const errorMessages = conflicts.map(c => c.message).join(', ');
    throw new Error(`No se puede guardar: ${errorMessages}`);
  }
  
  // Guardar si no hay conflictos
  await saveBlock(newBlock);
}
```

### Validar disponibilidad del profesor

```tsx
import { isTeacherAvailable } from '@/lib/utils/schedule';
import { DayOfWeek } from '@/types';

const teacher = {
  id: 'teacher-1',
  availability: [
    {
      teacherId: 'teacher-1',
      dayOfWeek: DayOfWeek.MONDAY,
      timeSlots: [
        { startTime: '08:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '17:00' },
      ],
    },
  ],
  // ... otros campos
};

// Verificar si está disponible
const available = isTeacherAvailable(
  teacher.availability,
  DayOfWeek.MONDAY,
  '09:00',
  '10:00'
);

console.log('Disponible:', available); // true
```

## 📊 Ejemplos de Visualización

### Dashboard con estadísticas

```tsx
import { Card, CardContent } from '@/components/ui';

export function DashboardStats() {
  const stats = [
    { icon: '🏫', label: 'Colegios', value: '3', color: 'primary' },
    { icon: '👨‍🏫', label: 'Profesores', value: '87', color: 'secondary' },
    { icon: '🎓', label: 'Cursos', value: '42', color: 'accent' },
    { icon: '📚', label: 'Asignaturas', value: '18', color: 'success' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl">{stat.icon}</div>
              <div>
                <div className="text-3xl font-bold text-neutral-900">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-600">
                  {stat.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Lista con búsqueda y paginación

```tsx
'use client';

import { useState } from 'react';
import { Input, Button } from '@/components/ui';
import { TeacherCard } from '@/modules/teachers/components';

export function TeacherListWithSearch({ teachers }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Filtrar por búsqueda
  const filtered = teachers.filter(teacher =>
    teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
    teacher.lastName.toLowerCase().includes(search.toLowerCase())
  );

  // Paginar
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTeachers = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Búsqueda */}
      <Input
        type="search"
        placeholder="Buscar profesores..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // Resetear a página 1
        }}
      />

      {/* Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          
          <span className="px-4 py-2 text-sm text-neutral-700">
            Página {page} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
```

## 🎯 Tips Rápidos

### Usar className dinámicamente

```tsx
import { cn } from '@/lib/utils/cn';

const isActive = true;

<div
  className={cn(
    'px-4 py-2 rounded-lg',
    isActive ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100',
    'hover:shadow-md transition-shadow'
  )}
>
  Contenido
</div>
```

### Formatear tiempo

```tsx
import { formatTime } from '@/lib/utils/schedule';

const time = '14:30';
console.log(formatTime(time)); // "2:30 PM"
```

### Generar ID único

```tsx
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const newId = generateId(); // "1703012345678-abc123def"
```

---

¿Más ejemplos? Consulta los componentes en `src/components` y módulos en `src/modules`.
