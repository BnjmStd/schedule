/**
 * ➕ AddTeacherButton - Botón para abrir el modal de crear profesor
 */

'use client';

import { useModal } from '@/contexts/ModalContext';
import { CreateTeacherForm } from './CreateTeacherForm';

export function AddTeacherButton() {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(<CreateTeacherForm />, '👨‍🏫 Crear Nuevo Profesor');
  };

  return (
    <button onClick={handleClick} className="schools-add-btn">
      + Agregar Profesor
    </button>
  );
}
