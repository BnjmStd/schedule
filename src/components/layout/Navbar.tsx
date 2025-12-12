/**
 * 🧭 Componente Navbar - Sistema de Horarios
 * 
 * Barra de navegación principal con diseño pastel
 */

import Link from 'next/link';
import { ReactNode } from 'react';

export interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">📅</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-neutral-900">
                Sistema de Horarios
              </span>
              <span className="text-xs text-neutral-500">
                Gestión Escolar
              </span>
            </div>
          </Link>

          {/* Navegación principal */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/schools">🏫 Colegios</NavLink>
            <NavLink href="/teachers">👨‍🏫 Profesores</NavLink>
            <NavLink href="/subjects">📚 Asignaturas</NavLink>
            <NavLink href="/courses">🎓 Cursos</NavLink>
            <NavLink href="/schedules">🗓️ Horarios</NavLink>
          </div>

          {/* Acciones adicionales */}
          {children}
        </div>
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
    >
      {children}
    </Link>
  );
}
