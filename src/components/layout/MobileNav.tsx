"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Botón Hamburguesa */}
      <button
        className={`mobile-nav-toggle ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      <div
        className={`mobile-nav-overlay ${isOpen ? "active" : ""}`}
        onClick={closeMenu}
      />

      {/* Sidebar */}
      <aside className={`mobile-nav-sidebar ${isOpen ? "active" : ""}`}>
        <div className="mobile-nav-header">
          <div className="mobile-nav-logo">
            <div className="mobile-nav-logo-icon">📅</div>
            <span className="mobile-nav-logo-text">Schedule</span>
          </div>
          <button
            className="mobile-nav-close"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mobile-nav-menu">
          <a href="#features" className="mobile-nav-link" onClick={closeMenu}>
            <span className="mobile-nav-link-icon">✨</span>
            Características
          </a>

          <div className="mobile-nav-divider" />

          <Link
            href="/auth/login"
            className="mobile-nav-link"
            onClick={closeMenu}
          >
            <span className="mobile-nav-link-icon">🔑</span>
            Iniciar Sesión
          </Link>

          <Link
            href="/auth/register"
            className="mobile-nav-link mobile-nav-link-primary"
            onClick={closeMenu}
          >
            <span className="mobile-nav-link-icon">🚀</span>
            Comenzar Gratis
          </Link>
        </nav>

        <div className="mobile-nav-footer">
          <p>✨ Sin tarjeta de crédito</p>
        </div>
      </aside>
    </>
  );
}
