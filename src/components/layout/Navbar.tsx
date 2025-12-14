/**
 * 🧭 Componente Navbar - Sistema de Horarios
 * 
 * Barra de navegación principal con diseño oscuro y menú hamburguesa responsive
 */

'use client';

import Link from 'next/link';
import { useState, ReactNode } from 'react';
import './Navbar.css';

export interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo y título */}
          <Link href="/dashboard" className="navbar-logo" onClick={closeMenu}>
            <div className="navbar-logo-icon">
              <span>📅</span>
            </div>
            <div className="navbar-logo-text">
              <span className="navbar-title">Sistema de Horarios</span>
              <span className="navbar-subtitle">Gestión Escolar</span>
            </div>
          </Link>

          {/* Navegación desktop */}
          <div className="navbar-menu-desktop">
            <NavLink href="/dashboard">🏠 Dashboard</NavLink>
            <NavLink href="/schools">🏫 Colegios</NavLink>
            <NavLink href="/teachers">👨‍🏫 Profesores</NavLink>
            <NavLink href="/subjects">📚 Asignaturas</NavLink>
            <NavLink href="/courses">🎓 Cursos</NavLink>
            <NavLink href="/schedules">🗓️ Horarios</NavLink>
          </div>

          {/* Acciones adicionales */}
          <div className="navbar-actions">
            {children}
          </div>

          {/* Botón hamburguesa */}
          <button
            className={`navbar-hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Overlay */}
      {isMenuOpen && (
        <div className="navbar-overlay" onClick={closeMenu} />
      )}

      {/* Menú móvil deslizante */}
      <div className={`navbar-menu-mobile ${isMenuOpen ? 'open' : ''}`}>
        <div className="navbar-menu-mobile-header">
          <span className="navbar-menu-mobile-title">Menú</span>
          <button
            className="navbar-menu-mobile-close"
            onClick={closeMenu}
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>
        
        <div className="navbar-menu-mobile-links">
          <MobileNavLink href="/dashboard" onClick={closeMenu}>
            🏠 Dashboard
          </MobileNavLink>
          <MobileNavLink href="/schools" onClick={closeMenu}>
            🏫 Colegios
          </MobileNavLink>
          <MobileNavLink href="/teachers" onClick={closeMenu}>
            👨‍🏫 Profesores
          </MobileNavLink>
          <MobileNavLink href="/subjects" onClick={closeMenu}>
            📚 Asignaturas
          </MobileNavLink>
          <MobileNavLink href="/courses" onClick={closeMenu}>
            🎓 Cursos
          </MobileNavLink>
          <MobileNavLink href="/schedules" onClick={closeMenu}>
            🗓️ Horarios
          </MobileNavLink>
        </div>
      </div>
    </>
  );
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link href={href} className="navbar-link">
      {children}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, children, onClick }: MobileNavLinkProps) {
  return (
    <Link href={href} className="navbar-mobile-link" onClick={onClick}>
      {children}
    </Link>
  );
}
