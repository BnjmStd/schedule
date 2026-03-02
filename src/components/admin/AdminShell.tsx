/**
 * 🏠 Admin Shell — Wrapper client con gestión del estado de sidebar
 *
 * Separa la lógica de estado (client) del fetch de sesión (server layout).
 */

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./AdminShell.module.css";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true },
  { href: "/admin/users", label: "Usuarios", icon: "👥", exact: false },
  { href: "/admin/subscriptions", label: "Suscripciones", icon: "💳", exact: false },
  { href: "/admin/pricing", label: "Planes & Precios", icon: "💰", exact: false },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Usuarios",
  "/admin/subscriptions": "Suscripciones",
  "/admin/pricing": "Planes & Precios",
};

interface AdminShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function AdminShell({ children, userName, userRole }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([key]) => pathname.startsWith(key))?.[1] ?? "Admin";

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  function getInitials(name: string): string {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  const sidebar = (
    <nav className={styles.sidebar} aria-label="Navegación de administración">
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true">⚙️</span>
          <div>
            <span className={styles.logoTitle}>Admin Panel</span>
            <span className={styles.logoSub}>BBschedule</span>
          </div>
        </div>
        <button
          className={styles.closeBtn}
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          ✕
        </button>
      </div>

      <ul className={styles.navList} role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href, item.exact) ? styles.navLinkActive : ""}`}
              onClick={() => setSidebarOpen(false)}
              aria-current={isActive(item.href, item.exact) ? "page" : undefined}
            >
              <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.divider} />

      <div className={styles.navBottom}>
        <Link href="/dashboard" className={styles.backLink} onClick={() => setSidebarOpen(false)}>
          <span aria-hidden="true">←</span>
          Volver a la App
        </Link>
      </div>

      <div className={styles.userCard}>
        <div className={styles.avatar} aria-hidden="true">{getInitials(userName)}</div>
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
    <div className={styles.shell}>
      {/* Desktop sidebar */}
      <aside className={styles.desktopSidebar} aria-label="Sidebar de administración">
        {sidebar}
      </aside>

      {/* Mobile overlay + drawer */}
      {sidebarOpen && (
        <>
          <div
            className={styles.overlay}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className={`${styles.mobileSidebar} ${styles.mobileSidebarOpen}`}>
            {sidebar}
          </aside>
        </>
      )}

      {/* Área principal */}
      <div className={styles.mainArea}>
        {/* Topbar */}
        <header className={styles.topbar} role="banner">
          <div className={styles.topbarLeft}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menú de administración"
              aria-expanded={sidebarOpen}
            >
              <span />
              <span />
              <span />
            </button>
            <h1 className={styles.topbarTitle}>{pageTitle}</h1>
          </div>
          <div className={styles.topbarRight}>
            <span className={styles.adminBadge}>
              {userRole === "super_admin" ? "⚡ Super Admin" : "🔧 Admin"}
            </span>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className={styles.pageContent} id="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
