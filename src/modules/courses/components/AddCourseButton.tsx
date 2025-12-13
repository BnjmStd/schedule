/**
 * ➕ AddCourseButton - Botón para abrir el modal de crear curso
 */

'use client';

import { useModal } from '@/contexts/ModalContext';
import { CreateCourseForm } from './CreateCourseForm';

export function AddCourseButton() {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(<CreateCourseForm />, '🎓 Crear Nuevo Curso');
  };

  return (
    <button onClick={handleClick} className="schools-add-btn">
      + Agregar Curso
    </button>
  );
}
