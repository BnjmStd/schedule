# 📖 Guía de Extensión del Sistema

Esta guía te ayudará a extender y personalizar el sistema de gestión de horarios escolares.

## 🎨 Cómo usar la paleta de colores

### En Tailwind CSS

Los colores están definidos en `app/globals.css` usando `@theme`. Puedes usarlos directamente:

```tsx
// Backgrounds
<div className="bg-primary-100">Fondo claro</div>
<div className="bg-primary-500">Fondo medio</div>
<div className="bg-primary-900">Fondo oscuro</div>

// Text colors
<p className="text-primary-600">Texto primario</p>
<p className="text-secondary-700">Texto secundario</p>

// Borders
<div className="border-2 border-accent-300">Con borde</div>

// Hover states
<button className="bg-primary-500 hover:bg-primary-600">
  Hover effect
</button>
```

### Variantes disponibles por color

Cada color tiene 10 variantes (50, 100, 200, ..., 900):
- **50-200**: Tonos muy claros (fondos, highlights)
- **300-400**: Tonos medios claros (borders, accents)
- **500-600**: Tonos principales (botones, badges)
- **700-800**: Tonos oscuros (texto, íconos)
- **900**: Tono más oscuro (headings, énfasis)

### Agregar nuevos colores

Edita `app/globals.css` dentro de `@theme`:

```css
@theme {
  /* Tus colores personalizados */
  --color-custom-50: #f0f9ff;
  --color-custom-100: #e0f2fe;
  /* ... más variantes */
  --color-custom-900: #0c4a6e;
}
```

Luego úsalos en tus componentes:
```tsx
<div className="bg-custom-100 text-custom-700">
  Mi color personalizado
</div>
```

## 🧩 Crear nuevos componentes UI

### Pasos para crear un componente

1. Crea el archivo en `src/components/ui/`:

```tsx
// src/components/ui/Alert.tsx
'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-primary-100 text-primary-800 border-primary-300',
  success: 'bg-success-100 text-success-800 border-success-300',
  warning: 'bg-warning-100 text-warning-800 border-warning-300',
  danger: 'bg-danger-100 text-danger-800 border-danger-300',
};

export function Alert({ 
  variant = 'info', 
  title, 
  children, 
  className 
}: AlertProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-lg border-2',
        variantStyles[variant],
        className
      )}
    >
      {title && (
        <h4 className="font-bold mb-2">{title}</h4>
      )}
      <div>{children}</div>
    </div>
  );
}
```

2. Exporta desde `src/components/ui/index.ts`:

```tsx
export { Alert } from './Alert';
export type { AlertProps, AlertVariant } from './Alert';
```

3. Úsalo en tus páginas:

```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="¡Éxito!">
  La operación se completó correctamente.
</Alert>
```

## 📦 Crear un nuevo módulo

### Estructura de un módulo

Cada módulo sigue esta estructura:

```
src/modules/[nombre]/
├── components/          # Componentes del módulo
│   ├── [Nombre]Card.tsx
│   ├── [Nombre]List.tsx
│   ├── [Nombre]Form.tsx
│   └── index.ts
├── actions/            # Server Actions
│   └── index.ts
└── types.ts           # Tipos específicos del módulo (opcional)
```

### Ejemplo: Crear módulo de "Estudiantes"

#### 1. Definir tipos en `src/types/index.ts`:

```typescript
export interface Student {
  id: string;
  schoolId: string;
  courseId: string;
  firstName: string;
  lastName: string;
  email: string;
  enrollmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateStudentInput = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateStudentInput = Partial<CreateStudentInput> & { id: string };
```

#### 2. Crear mock DB en `src/db/students.ts`:

```typescript
import { Student } from '@/types';

let students: Student[] = [];

export const studentsDb = {
  getAll: async (): Promise<Student[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return students;
  },

  getByCourse: async (courseId: string): Promise<Student[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return students.filter(s => s.courseId === courseId);
  },

  create: async (data: CreateStudentInput): Promise<Student> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newStudent: Student = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    students.push(newStudent);
    return newStudent;
  },

  // ... más métodos
};
```

#### 3. Crear Server Actions en `src/modules/students/actions/index.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { studentsDb } from '@/db/students';
import { CreateStudentInput, Student } from '@/types';

export async function getStudents(): Promise<Student[]> {
  return await studentsDb.getAll();
}

export async function getStudentsByCourse(courseId: string): Promise<Student[]> {
  return await studentsDb.getByCourse(courseId);
}

export async function createStudent(data: CreateStudentInput): Promise<Student> {
  const student = await studentsDb.create(data);
  revalidatePath('/students');
  return student;
}
```

#### 4. Crear componentes en `src/modules/students/components/`:

```tsx
// StudentCard.tsx
'use client';

import { Student } from '@/types';
import { Card, CardContent, Badge } from '@/components/ui';

export interface StudentCardProps {
  student: Student;
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-bold text-neutral-900">
          {student.firstName} {student.lastName}
        </h3>
        <p className="text-sm text-neutral-600">{student.email}</p>
        <Badge variant="primary" className="mt-2">
          Activo
        </Badge>
      </CardContent>
    </Card>
  );
}
```

#### 5. Crear página en `app/students/page.tsx`:

```tsx
import { Container, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui';
import { getStudents } from '@/modules/students/actions';
import { StudentCard } from '@/modules/students/components';

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <Container>
      <PageHeader
        title="👨‍🎓 Estudiantes"
        description="Administra los estudiantes del colegio."
        actions={
          <Button variant="primary">
            + Agregar Estudiante
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </Container>
  );
}
```

## 🗓️ Personalizar el ScheduleGrid

### Cambiar bloques de tiempo

Modifica `DEFAULT_TIME_BLOCKS` en `src/types/index.ts`:

```typescript
export const DEFAULT_TIME_BLOCKS: TimeBlock[] = [
  { id: '1', blockNumber: 1, startTime: '08:00', endTime: '09:00', duration: 60 },
  { id: '2', blockNumber: 2, startTime: '09:00', endTime: '10:00', duration: 60 },
  // ... tus bloques personalizados
];
```

### Cambiar colores de días

Edita en `app/globals.css`:

```css
@theme {
  --color-schedule-monday: #e0f2fe;    /* Azul */
  --color-schedule-tuesday: #fce7f3;   /* Rosa */
  --color-schedule-wednesday: #f3e8ff; /* Lavanda */
  --color-schedule-thursday: #ecfccb;  /* Verde */
  --color-schedule-friday: #ffedd5;    /* Naranja */
}
```

### Agregar funcionalidad de arrastrar y soltar

Instala `@dnd-kit`:

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

Modifica `ScheduleGrid.tsx` para incluir drag & drop:

```tsx
import { DndContext, DragEndEvent } from '@dnd-kit/core';

export function ScheduleGrid({ schedule, onBlockMove }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      onBlockMove?.(active.id, over.id);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* Tu grilla existente */}
    </DndContext>
  );
}
```

## 🔌 Integrar base de datos real

### Usando Prisma

1. Instala Prisma:

```bash
npm install prisma @prisma/client
npx prisma init
```

2. Define tu schema en `prisma/schema.prisma`:

```prisma
model School {
  id        String   @id @default(cuid())
  name      String
  address   String
  phone     String?
  email     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  teachers  Teacher[]
  courses   Course[]
  subjects  Subject[]
}

model Teacher {
  id             String   @id @default(cuid())
  schoolId       String
  firstName      String
  lastName       String
  email          String   @unique
  specialization String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  school         School   @relation(fields: [schoolId], references: [id])
}

// ... más modelos
```

3. Reemplaza los mocks:

```typescript
// src/db/schools.ts
import { prisma } from '@/lib/prisma';

export const schoolsDb = {
  getAll: async () => {
    return await prisma.school.findMany();
  },

  create: async (data) => {
    return await prisma.school.create({ data });
  },

  // ... más métodos
};
```

## 🔐 Agregar autenticación

### Usando NextAuth.js

1. Instala NextAuth:

```bash
npm install next-auth
```

2. Crea `app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

3. Protege tus páginas:

```tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  return <div>Contenido protegido</div>;
}
```

## 📊 Agregar validaciones avanzadas

Crea validaciones personalizadas en `src/lib/validations/`:

```typescript
// src/lib/validations/schedule.ts
import { ScheduleBlock, Teacher } from '@/types';

export function validateWeeklyWorkload(
  teacherId: string,
  blocks: ScheduleBlock[]
): { isValid: boolean; message?: string } {
  const teacherBlocks = blocks.filter(b => b.teacherId === teacherId);
  const totalHours = teacherBlocks.reduce(
    (sum, block) => sum + block.timeBlock.duration / 60,
    0
  );

  const MAX_HOURS = 40;

  if (totalHours > MAX_HOURS) {
    return {
      isValid: false,
      message: `El profesor excede las ${MAX_HOURS} horas semanales permitidas`,
    };
  }

  return { isValid: true };
}
```

## 🎯 Tips y mejores prácticas

1. **Mantén la estructura modular**: Cada módulo debe ser independiente
2. **Usa Server Actions**: Para operaciones que modifican datos
3. **Tipado estricto**: Siempre define tipos para tus datos
4. **Reutiliza componentes**: Usa los componentes UI existentes
5. **Sigue la paleta**: Usa los colores definidos en @theme
6. **Documenta**: Agrega comentarios JSDoc a tus funciones
7. **Valida datos**: Siempre valida antes de guardar

## 🚀 Deployment

### Vercel (Recomendado)

```bash
npm install -g vercel
vercel
```

### Variables de entorno

Crea `.env.local`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="tu-secret"
NEXTAUTH_URL="https://tu-dominio.com"
```

---

¿Necesitas ayuda? Consulta la [documentación de Next.js](https://nextjs.org/docs) o abre un issue en el repositorio.
