# 🗓️ Sistema de Gestión de Horarios Escolares

Sistema profesional para la gestión de horarios, profesores, asignaturas y cursos en instituciones educativas. Construido con **Next.js 16**, **React Server Components** y **TailwindCSS v4**.

## ✨ Características Principales

### 🎨 Diseño Pastel Profesional
- Paleta de colores cuidadosamente seleccionada usando `@theme` de Tailwind v4
- Componentes UI reutilizables (Button, Card, Badge, Input, Select)
- Diseño responsive y moderno
- Animaciones suaves y transiciones elegantes

### 🏗️ Arquitectura Escalable
- **Clean Architecture** + **Domain-Driven Design (DDD)**
- Estructura modular feature-first
- Server Actions de Next.js 16
- TypeScript con tipado estricto
- Separación clara de responsabilidades

### 📊 Funcionalidades del Sistema
- ✅ Gestión de múltiples colegios (90+ profesores, 45+ cursos por colegio)
- ✅ Administración de profesores con disponibilidad semanal
- ✅ Gestión de asignaturas y asignación a profesores
- ✅ Creación de cursos y secciones
- ✅ Visualización de horarios semanales (Lunes-Viernes)
- ✅ Detección automática de conflictos de horario
- ✅ Validación de disponibilidad de profesores
- ✅ Reportes y estadísticas

## 📁 Estructura del Proyecto

```
/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Layout principal con Navbar
│   ├── page.tsx             # Página de inicio
│   ├── schools/             # Página de colegios
│   ├── teachers/            # Página de profesores
│   ├── subjects/            # Página de asignaturas
│   ├── courses/             # Página de cursos
│   ├── schedules/           # Página de horarios
│   └── reports/             # Página de reportes
│
├── src/
│   ├── components/          # Componentes compartidos
│   │   ├── ui/             # Componentes UI base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Select.tsx
│   │   └── layout/         # Componentes de layout
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Container.tsx
│   │       └── PageHeader.tsx
│   │
│   ├── modules/            # Módulos del dominio
│   │   ├── schools/
│   │   │   ├── components/
│   │   │   └── actions/
│   │   ├── teachers/
│   │   │   ├── components/
│   │   │   └── actions/
│   │   ├── subjects/
│   │   │   ├── components/
│   │   │   └── actions/
│   │   ├── courses/
│   │   │   ├── components/
│   │   │   └── actions/
│   │   └── schedules/
│   │       ├── components/
│   │       │   └── ScheduleGrid.tsx  # ⭐ Grilla visual de horarios
│   │       └── actions/
│   │
│   ├── types/              # Tipos TypeScript del dominio
│   │   └── index.ts        # School, Teacher, Subject, Course, Schedule, etc.
│   │
│   ├── lib/                # Utilidades y helpers
│   │   ├── utils/
│   │   │   ├── cn.ts      # Utility para className
│   │   │   └── schedule.ts # Utilidades de horarios
│   │   └── validations/   # Validaciones de negocio
│   │
│   └── db/                 # Capa de datos (mock)
│       └── schools.ts      # Base de datos simulada
│
└── app/
    └── globals.css         # Estilos globales + @theme Tailwind v4
```

## 🎨 Paleta de Colores Pastel

La aplicación usa una paleta de colores pastel profesional definida en `app/globals.css`:

### Colores Principales
- **Primary (Azul pastel)**: Profesionalismo y confianza
- **Secondary (Rosa pastel)**: Acento cálido y amigable
- **Accent (Lavanda pastel)**: Elegancia y sofisticación
- **Success (Verde pastel)**: Confirmación y éxito
- **Warning (Amarillo pastel)**: Advertencias suaves
- **Danger (Rojo pastel)**: Errores y alertas

### Colores para Horarios
- `schedule-monday`: Azul claro (#e0f2fe)
- `schedule-tuesday`: Rosa claro (#fce7f3)
- `schedule-wednesday`: Lavanda claro (#f3e8ff)
- `schedule-thursday`: Verde claro (#ecfccb)
- `schedule-friday`: Naranja claro (#ffedd5)

### Uso en Componentes

```tsx
// Usar colores en componentes
<Button variant="primary">Click me</Button>
<Badge variant="success">Activo</Badge>
<div className="bg-primary-100 text-primary-700">Contenido</div>
```

## 🧩 Componentes UI Principales

### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Guardar
</Button>
```

**Variantes**: primary, secondary, accent, success, warning, danger, ghost, outline  
**Tamaños**: sm, md, lg

### Card
```tsx
import { Card, CardContent, CardTitle } from '@/components/ui';

<Card>
  <CardContent>
    <CardTitle>Título</CardTitle>
    <p>Contenido de la tarjeta</p>
  </CardContent>
</Card>
```

### Badge
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Activo</Badge>
```

### Input y Select
```tsx
import { Input, Select } from '@/components/ui';

<Input 
  label="Nombre"
  placeholder="Ingrese nombre"
  required
/>

<Select
  label="Seleccione"
  options={[
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' }
  ]}
/>
```

## 🗓️ Componente ScheduleGrid

El componente más importante del sistema - visualización de horarios semanales:

```tsx
import { ScheduleGrid } from '@/modules/schedules/components';
import { DEFAULT_TIME_BLOCKS } from '@/types';

<ScheduleGrid
  schedule={schedule}
  timeBlocks={DEFAULT_TIME_BLOCKS}
  onBlockClick={(block, day, timeBlock) => {
    console.log('Block clicked:', { block, day, timeBlock });
  }}
  showConflicts={true}
/>
```

**Características:**
- Visualización de Lunes a Viernes
- Bloques de tiempo configurables
- Colores por asignatura
- Detección visual de conflictos
- Click handlers para edición
- Diseño responsive

## 📘 Tipos del Dominio

El sistema está completamente tipado con interfaces TypeScript:

```typescript
import {
  School,
  Teacher,
  Subject,
  Course,
  Schedule,
  ScheduleBlock,
  TimeBlock,
  DayOfWeek,
  ConflictType,
} from '@/types';
```

### Tipos Principales

- **School**: Información de colegios
- **Teacher**: Profesores con disponibilidad
- **Subject**: Asignaturas y códigos
- **Course**: Cursos, grados y secciones
- **Schedule**: Horarios completos
- **ScheduleBlock**: Bloques individuales de horario
- **TimeBlock**: Bloques de tiempo (08:00-09:00, etc.)

## ⚙️ Server Actions

El sistema usa Server Actions de Next.js 16 para operaciones del servidor:

```typescript
import { 
  getSchools, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from '@/modules/schools/actions';

// Usar en componentes
const schools = await getSchools();
const newSchool = await createSchool(data);
```

## 🔍 Validación de Conflictos

Sistema inteligente de detección de conflictos:

```typescript
import { detectScheduleConflicts } from '@/lib/utils/schedule';

const conflicts = detectScheduleConflicts(block, allBlocks, teacher);
// Retorna: ScheduleConflict[]
```

**Tipos de conflictos detectados:**
- ❌ Profesor en dos lugares al mismo tiempo
- ⚠️ Profesor no disponible en ese horario
- ❌ Sala ocupada
- ❌ Curso con bloques superpuestos
- ⚠️ Profesor no dicta esa asignatura

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 20+
- npm, yarn o pnpm

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📦 Dependencias

```json
{
  "dependencies": {
    "next": "16.0.10",
    "react": "19.2.1",
    "react-dom": "19.2.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "tailwindcss": "^4",
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/node": "^20"
  }
}
```

## 🎯 Próximos Pasos

### Base de Datos Real
Actualmente usa datos mock en memoria. Para producción, integrar:
- **Prisma** (recomendado)
- **Drizzle ORM**
- **Supabase**
- Cualquier base de datos PostgreSQL/MySQL

### Autenticación
- NextAuth.js
- Clerk
- Auth0

### Características Adicionales
- Drag & Drop para asignar bloques
- Exportar horarios a PDF
- Notificaciones por email
- Vista de calendario mensual
- Gestión de asistencia
- Reportes avanzados
- Dashboard analytics

## 📚 Recursos

### Documentación
- [Next.js 16](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Arquitectura
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

## 🤝 Contribuir

Este proyecto está diseñado para ser extendible y mantenible. Para contribuir:

1. Sigue la estructura modular existente
2. Mantén el tipado estricto de TypeScript
3. Usa los componentes UI existentes
4. Documenta nuevas características
5. Sigue los principios de Clean Architecture

## 📝 Licencia

MIT License

---

**Desarrollado con ❤️ usando Next.js 16, React Server Components y TailwindCSS v4**
