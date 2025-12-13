# 🎭 Sistema de Modales Escalable

## Descripción

Este proyecto implementa un sistema de modales global, escalable y reutilizable que permite mostrar contenido dinámico en ventanas modales desde cualquier parte de la aplicación.

## Arquitectura

### 1. **ModalContext** (`src/contexts/ModalContext.tsx`)

Contexto de React que gestiona el estado global de los modales:

```tsx
interface ModalContextValue {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  openModal: (content: ReactNode, title?: string) => void;
  closeModal: () => void;
}
```

- `isOpen`: Estado del modal (abierto/cerrado)
- `content`: Contenido dinámico a mostrar
- `title`: Título del modal
- `openModal()`: Función para abrir el modal con contenido
- `closeModal()`: Función para cerrar el modal

### 2. **Modal Component** (`src/components/ui/Modal.tsx`)

Componente base que renderiza la estructura del modal:

**Características:**
- ✅ Overlay con blur effect
- ✅ Animaciones suaves de entrada/salida
- ✅ Cierre con tecla ESC
- ✅ Cierre al hacer click en el overlay
- ✅ Botón de cerrar (X)
- ✅ Previene scroll del body cuando está abierto
- ✅ Responsive
- ✅ Contenido scrolleable

### 3. **ModalProvider**

Proveedor que debe envolver la aplicación (o sección) donde se usarán modales.

## Uso

### Setup Inicial

1. **Agregar el ModalProvider en el layout:**

```tsx
// app/(protected)/layout.tsx
import { ModalProvider } from '@/contexts/ModalContext';
import { Modal } from '@/components/ui';

export default function ProtectedLayout({ children }) {
  return (
    <ModalProvider>
      <Navbar />
      <main>{children}</main>
      <Modal /> {/* Componente que renderiza el modal */}
    </ModalProvider>
  );
}
```

### Abrir un Modal

#### Opción 1: Con Hook `useModal()`

```tsx
'use client';

import { useModal } from '@/contexts/ModalContext';

export function MyComponent() {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(
      <div>
        <p>Contenido del modal</p>
      </div>,
      'Título del Modal'
    );
  };

  return <button onClick={handleClick}>Abrir Modal</button>;
}
```

#### Opción 2: Con Componentes de Botón Dedicados

```tsx
'use client';

import { useModal } from '@/contexts/ModalContext';
import { CreateSchoolForm } from './CreateSchoolForm';

export function AddSchoolButton() {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(<CreateSchoolForm />, '🏫 Crear Nuevo Colegio');
  };

  return (
    <button onClick={handleClick}>
      + Agregar Colegio
    </button>
  );
}
```

### Cerrar un Modal

```tsx
'use client';

import { useModal } from '@/contexts/ModalContext';

export function MyModalContent() {
  const { closeModal } = useModal();

  return (
    <div>
      <p>Contenido</p>
      <button onClick={closeModal}>Cerrar</button>
    </div>
  );
}
```

## Ejemplos Implementados

### 1. **CreateSchoolForm**

Formulario para crear colegios:
- Ubicación: `src/modules/schools/components/CreateSchoolForm.tsx`
- Botón: `AddSchoolButton.tsx`
- Uso en: `app/(protected)/schools/page.tsx`

### 2. **CreateTeacherForm**

Formulario para crear profesores:
- Ubicación: `src/modules/teachers/components/CreateTeacherForm.tsx`
- Botón: `AddTeacherButton.tsx`
- Incluye: Selector de colegio, nombre, apellido, email, teléfono, especialización

### 3. **CreateSubjectForm**

Formulario para crear asignaturas:
- Ubicación: `src/modules/subjects/components/CreateSubjectForm.tsx`
- Botón: `AddSubjectButton.tsx`
- Incluye: Selector de colegio, nombre, código, descripción, selector de color

### 4. **CreateCourseForm**

Formulario para crear cursos:
- Ubicación: `src/modules/courses/components/CreateCourseForm.tsx`
- Botón: `AddCourseButton.tsx`
- Incluye: Selector de colegio, nombre, grado, sección, nivel académico, año, cantidad de estudiantes

## Patrón de Diseño

### Estructura de un Formulario Modal

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '@/contexts/ModalContext';
import { createSomething } from '@/modules/something/actions';
import { Input, Button } from '@/components/ui';

export function CreateSomethingForm() {
  const router = useRouter();
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      // Extraer datos del formulario
    };

    try {
      await createSomething(data);
      closeModal(); // Cerrar modal después de éxito
      router.refresh(); // Refrescar datos
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      
      {/* Campos del formulario */}
      
      <div className="form-actions">
        <Button
          type="button"
          variant="secondary"
          onClick={closeModal}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Creando...' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
```

### Estructura de un Botón

```tsx
'use client';

import { useModal } from '@/contexts/ModalContext';
import { CreateSomethingForm } from './CreateSomethingForm';

export function AddSomethingButton() {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(<CreateSomethingForm />, '✨ Título del Modal');
  };

  return (
    <button onClick={handleClick} className="add-btn">
      + Agregar Algo
    </button>
  );
}
```

## Ventajas del Sistema

✅ **Escalable**: Fácil agregar nuevos modales sin duplicar código
✅ **Reutilizable**: Un solo componente Modal para toda la app
✅ **Flexible**: Acepta cualquier contenido React como children
✅ **Accesible**: Soporta cierre con ESC y click en overlay
✅ **Performante**: Solo renderiza cuando está abierto
✅ **Type-Safe**: Completamente tipado con TypeScript
✅ **Clean Code**: Separación clara de responsabilidades

## Próximos Pasos

Para agregar un nuevo modal:

1. Crear el formulario en `src/modules/[module]/components/Create[Entity]Form.tsx`
2. Crear el botón en `src/modules/[module]/components/Add[Entity]Button.tsx`
3. Exportar ambos en `src/modules/[module]/components/index.ts`
4. Usar el botón en la página correspondiente

¡Es así de simple! 🚀
