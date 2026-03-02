/**
 * ➕ AddTeacherButton - Botón para abrir el modal de crear profesor
 */

"use client";

import { useModal } from "@/contexts/ModalContext";
import { CreateTeacherForm } from "./CreateTeacherForm";

interface AddTeacherButtonProps {
  onTeacherCreated?: () => void;
}

export function AddTeacherButton({ onTeacherCreated }: AddTeacherButtonProps) {
  const { openModal } = useModal();

  const handleClick = () => {
    openModal(
      <CreateTeacherForm onTeacherCreated={onTeacherCreated} />,
      "👨‍🏫 Crear Nuevo Profesor",
    );
  };

  return (
    <button onClick={handleClick} className="schools-add-btn">
      + Agregar Profesor
    </button>
  );
}
