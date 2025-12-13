/**
 * 🎭 Modal Context - Sistema de modales global y escalable
 *
 * Este contexto permite abrir modales desde cualquier parte de la aplicación
 * pasando contenido dinámico como children o componentes.
 */

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextValue {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  openModal: (content: ReactNode, title?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState("");

  const openModal = (content: ReactNode, title: string = "") => {
    setContent(content);
    setTitle(title);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Limpiar el contenido después de la animación de cierre
    setTimeout(() => {
      setContent(null);
      setTitle("");
    }, 300);
  };

  return (
    <ModalContext.Provider
      value={{ isOpen, content, title, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
