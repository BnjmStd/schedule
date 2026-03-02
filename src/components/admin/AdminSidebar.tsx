/**
 * 🧭 Admin Sidebar — Navegación del panel de administración
 *
 * Client component para el toggle mobile y resaltado de ruta activa.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./AdminSidebar.module.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/users", label: "Usuarios", icon: "👥", exact: false },
  { href: "/admin/subscriptions", label: "Suscripciones", icon: "💳", exact: false },
  { href: "/admin/pricing", label: "Planes & Precios", icon: "💰", exact: false },
] as const;

interface AdminSidebarProps {
  userName: string;
  userRole: string;
}

export function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  const sidebarContent = (
    <nav className={styles.sidebar} aria-label="Navegación de administración">
      {/* Header del sidebar */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚙️</span>
          <div>
            <span className={styles.logoTitle}>Admin Panel</span>
            <span className={styles.logoSub}>BBschedule</span>
          </div>
        </div>
        {/* Boton cerrar en mobile */}
        <button
          className={styles.closeBtn}
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      {/* Links de navegación */}
      <ul className={styles.navList} role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href, item.exact) ? styles.navLinkActive : ""}`}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive(item.href, item.exact) ? "page" : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {isActive(item.href, item.exact) && (
                <span className={styles.activeIndicator} aria-hidden="true" />
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Separador */}
      <div className={styles.divider} />

      {/* Link de regreso a la app */}
      <div className={styles.navBottom}>
        <Link href="/dashboard" className={styles.backLink} onClick={() => setMobileOpen(false)}>
          <span aria-hidden="true">← </span>
          Volver a la App
        </Link>
      </div>

      {/* Usuario actual */}
      <div className={styles.userCard}>
        <div className={styles.userAvatar} aria-hidden="true">
          {getInitials(userName)}
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>
            {userRole === "super_admin" ? "Super Admin" : "Admin"}
          </span>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Botón hamburguesa (solo mobile) */}
      <button
        className={styles.hamburger}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú de administración"
        aria-expanded={mobileOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Sidebar desktop — siempre visible */}
      <div className={styles.desktopSidebar}>{sidebarContent}</div>

      {/* Sidebar mobile — overlay */}
      {mobileOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className={`${styles.mobileSidebar} ${styles.mobileSidebarOpen}`}>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
