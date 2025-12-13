/**
 * ➕ AddSchoolButton - Botón para abrir el modal de crear colegio
 */

'use client';

import { useModal } from '@/contexts/ModalContext';
import { CreateSchoolForm } from './CreateSchoolForm';

export function AddSchoolButton() {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(<CreateSchoolForm />, '🏫 Crear Nuevo Colegio');
  };

  return (
    <button onClick={handleClick} className="schools-add-btn">
      + Agregar Colegio
    </button>
  );
}
