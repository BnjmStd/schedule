"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

// ── Types ─────────────────────────────────────────────────────

interface RecentUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  subscription: { plan: string; status: string } | null;
}

interface Stats {
  totalUsers: number;
  newUsersLast30Days: number;
  totalSchools: number;
  totalTeachers: number;
  estimatedMRR: number;
  subscriptions: {
    byPlan: Record<string, number>;
    byStatus: Record<string, number>;
    active: number;
    total: number;
  };
  recentUsers: RecentUser[];
}

// ── Helpers ───────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function planColor(plan: string): string {
  switch (plan) {
    case "PRO":
      return styles.planPro;
    case "ENTERPRISE":
      return styles.planEnterprise;
    default:
      return styles.planFree;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return styles.statusActive;
    case "TRIALING":
      return styles.statusTrialing;
    case "PAST_DUE":
    case "EXPIRED":
      return styles.statusExpired;
    case "CANCELED":
      return styles.statusCanceled;
    default:
      return styles.statusNeutral;
  }
}

// ── Component ─────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar estadísticas");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loading} aria-busy="true" aria-label="Cargando estadísticas">
        <div className={styles.spinner} />
        <span>Cargando estadísticas…</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={styles.errorState} role="alert">
        <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
        <p>{error ?? "No se pudieron cargar las estadísticas."}</p>
        <button className={styles.retryBtn} onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  const totalSubs = stats.subscriptions.total || 1;
  const freeCount = stats.subscriptions.byPlan.FREE ?? 0;
  const proCount = stats.subscriptions.byPlan.PRO ?? 0;
  const enterpriseCount = stats.subscriptions.byPlan.ENTERPRISE ?? 0;

  return (
    <div className={styles.page}>
      {/* ── KPI Cards ──────────────────────────────────────── */}
      <section className={styles.kpiGrid} aria-label="Métricas clave">
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} aria-hidden="true">👥</div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{stats.totalUsers.toLocaleString()}</span>
            <span className={styles.kpiLabel}>Usuarios totales</span>
          </div>
          <div className={styles.kpiChip}>
            +{stats.newUsersLast30Days} este mes
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} aria-hidden="true">✅</div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{stats.subscriptions.active.toLocaleString()}</span>
            <span className={styles.kpiLabel}>Suscripciones activas</span>
          </div>
          <div className={styles.kpiChip}>
            {stats.subscriptions.total} total
          </div>
        </div>

        <div className={`${styles.kpiCard} ${styles.kpiCardHighlight}`}>
          <div className={styles.kpiIcon} aria-hidden="true">💰</div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{formatCurrency(stats.estimatedMRR)}</span>
            <span className={styles.kpiLabel}>MRR estimado</span>
          </div>
          <div className={styles.kpiChip}>por mes</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} aria-hidden="true">🏫</div>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{stats.totalSchools.toLocaleString()}</span>
            <span className={styles.kpiLabel}>Colegios registrados</span>
          </div>
          <div className={styles.kpiChip}>
            {stats.totalTeachers} profesores
          </div>
        </div>
      </section>

      {/* ── Distribución de planes ──────────────────────────── */}
      <section className={styles.section} aria-label="Distribución de planes">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Distribución de planes</h2>
          <Link href="/admin/subscriptions" className={styles.sectionLink}>
            Ver todas →
          </Link>
        </header>

        <div className={styles.planDistribution}>
          {/* Barra de distribución */}
          <div className={styles.planBar} role="img" aria-label="Barra de distribución de planes">
            {freeCount > 0 && (
              <div
                className={`${styles.planBarSegment} ${styles.planBarFree}`}
                style={{ width: `${(freeCount / totalSubs) * 100}%` }}
                title={`FREE: ${freeCount}`}
              />
            )}
            {proCount > 0 && (
              <div
                className={`${styles.planBarSegment} ${styles.planBarPro}`}
                style={{ width: `${(proCount / totalSubs) * 100}%` }}
                title={`PRO: ${proCount}`}
              />
            )}
            {enterpriseCount > 0 && (
              <div
                className={`${styles.planBarSegment} ${styles.planBarEnterprise}`}
                style={{ width: `${(enterpriseCount / totalSubs) * 100}%` }}
                title={`ENTERPRISE: ${enterpriseCount}`}
              />
            )}
          </div>

          {/* Leyenda */}
          <div className={styles.planLegend}>
            {[
              { label: "FREE", count: freeCount, cls: styles.legendDotFree },
              { label: "PRO", count: proCount, cls: styles.legendDotPro },
              { label: "ENTERPRISE", count: enterpriseCount, cls: styles.legendDotEnterprise },
            ].map(({ label, count, cls }) => (
              <div key={label} className={styles.legendItem}>
                <span className={`${styles.legendDot} ${cls}`} aria-hidden="true" />
                <span className={styles.legendLabel}>{label}</span>
                <span className={styles.legendCount}>{count}</span>
                <span className={styles.legendPct}>
                  ({Math.round((count / totalSubs) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Accesos rápidos ─────────────────────────────────── */}
      <section className={styles.quickLinks} aria-label="Accesos rápidos">
        <Link href="/admin/users" className={styles.quickLink}>
          <span className={styles.quickLinkIcon} aria-hidden="true">👥</span>
          <span>Gestionar usuarios</span>
        </Link>
        <Link href="/admin/subscriptions" className={styles.quickLink}>
          <span className={styles.quickLinkIcon} aria-hidden="true">💳</span>
          <span>Gestionar suscripciones</span>
        </Link>
        <Link href="/admin/pricing" className={styles.quickLink}>
          <span className={styles.quickLinkIcon} aria-hidden="true">💰</span>
          <span>Ver planes y precios</span>
        </Link>
        <Link href="/api/cron/expire-subscriptions" className={styles.quickLink} target="_blank">
          <span className={styles.quickLinkIcon} aria-hidden="true">🔄</span>
          <span>Cron: expirar subs</span>
        </Link>
      </section>

      {/* ── Usuarios recientes ──────────────────────────────── */}
      <section className={styles.section} aria-label="Usuarios recientes">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Usuarios recientes</h2>
          <Link href="/admin/users" className={styles.sectionLink}>
            Ver todos →
          </Link>
        </header>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col" className={styles.hideOnMobile}>Rol</th>
                <th scope="col">Plan</th>
                <th scope="col" className={styles.hideOnMobile}>Registro</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userInitials} aria-hidden="true">
                        {(user.name ?? user.email).substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.userName}>{user.name ?? "—"}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`${styles.roleCell} ${styles.hideOnMobile}`}>
                    <span className={`${styles.roleBadge} ${user.role === "admin" || user.role === "super_admin" ? styles.roleBadgeAdmin : styles.roleBadgeUser}`}>
                      {user.role === "super_admin" ? "Super Admin" : user.role === "admin" ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.planBadge} ${planColor(user.subscription?.plan ?? "FREE")}`}>
                      {user.subscription?.plan ?? "FREE"}
                    </span>
                  </td>
                  <td className={styles.hideOnMobile}>
                    <span className={styles.dateCell}>{formatDate(user.createdAt)}</span>
                  </td>
                  <td>
                    <Link href={`/admin/users?highlight=${user.id}`} className={styles.actionLink}>
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Estado de suscripciones ─────────────────────────── */}
      <section className={styles.section} aria-label="Estado de suscripciones">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Estado de suscripciones</h2>
        </header>
        <div className={styles.statusGrid}>
          {Object.entries(stats.subscriptions.byStatus).map(([status, count]) => (
            <div key={status} className={styles.statusCard}>
              <span className={`${styles.statusBadge} ${statusColor(status)}`}>{status}</span>
              <span className={styles.statusCount}>{count}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
