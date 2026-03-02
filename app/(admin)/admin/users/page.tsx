"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

// ── Types ─────────────────────────────────────────────────────

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  _count: { schools: number };
}

interface UsersResponse {
  users: UserRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CL", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function planClass(plan: string) {
  if (plan === "PRO") return styles.planPro;
  if (plan === "ENTERPRISE") return styles.planEnt;
  return styles.planFree;
}

function statusClass(status: string) {
  if (status === "ACTIVE" || status === "TRIALING") return styles.statusOk;
  if (status === "PAST_DUE" || status === "EXPIRED") return styles.statusBad;
  return styles.statusNeutral;
}

// ── Component ─────────────────────────────────────────────────

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div style={{ padding: "2rem", color: "rgba(255,255,255,0.4)" }}>Cargando…</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);

  // Role editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Debounce search
  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      ...(searchDebounced ? { search: searchDebounced } : {}),
      ...(roleFilter ? { role: roleFilter } : {}),
      ...(planFilter ? { plan: planFilter } : {}),
    });

    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json() as Promise<UsersResponse>)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, searchDebounced, roleFilter, planFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchDebounced, roleFilter, planFilter]);

  async function saveRole(userId: string) {
    setSavingId(userId);
    setRoleError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editingRole }),
      });
      if (!res.ok) {
        const j = await res.json();
        setRoleError(j.error ?? "Error al guardar");
        return;
      }
      setEditingId(null);
      fetchUsers();
    } catch {
      setRoleError("Error de conexión");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Filters ─────────────────────────────────────────── */}
      <div className={styles.filters} role="search" aria-label="Filtros de usuarios">
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar usuarios"
        />
        <select
          className={styles.filterSelect}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="Filtrar por rol"
        >
          <option value="">Todos los roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select
          className={styles.filterSelect}
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          aria-label="Filtrar por plan"
        >
          <option value="">Todos los planes</option>
          <option value="FREE">FREE</option>
          <option value="PRO">PRO</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
        {data && (
          <span className={styles.resultCount} aria-live="polite">
            {data.total} resultado{data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {roleError && (
        <div className={styles.errorBanner} role="alert">
          ⚠️ {roleError}
          <button onClick={() => setRoleError(null)} className={styles.dismissBtn}>✕</button>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────── */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingRow} aria-busy="true">
            <div className={styles.spinner} />
            <span>Cargando usuarios…</span>
          </div>
        ) : data?.users.length === 0 ? (
          <div className={styles.emptyState} role="status">
            <span aria-hidden="true">🔍</span>
            <p>No se encontraron usuarios con esos filtros.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col" className={styles.hideOnMobile}>Colegios</th>
                  <th scope="col">Rol</th>
                  <th scope="col">Plan</th>
                  <th scope="col" className={styles.hideOnTablet}>Registro</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.users.map((user) => (
                  <tr
                    key={user.id}
                    className={`${styles.tableRow} ${highlightId === user.id ? styles.rowHighlighted : ""}`}
                    id={`user-${user.id}`}
                  >
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} aria-hidden="true">
                          {(user.name ?? user.email).substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userName}>{user.name ?? "—"}</div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className={styles.hideOnMobile}>
                      <span className={styles.countBadge}>{user._count.schools}</span>
                    </td>

                    <td>
                      {editingId === user.id ? (
                        <div className={styles.roleEditor}>
                          <select
                            className={styles.roleSelect}
                            value={editingRole}
                            onChange={(e) => setEditingRole(e.target.value)}
                            aria-label="Seleccionar nuevo rol"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="super_admin">super_admin</option>
                          </select>
                          <button
                            className={styles.saveBtn}
                            onClick={() => saveRole(user.id)}
                            disabled={savingId === user.id}
                            aria-label="Guardar rol"
                          >
                            {savingId === user.id ? "…" : "✓"}
                          </button>
                          <button
                            className={styles.cancelBtn}
                            onClick={() => setEditingId(null)}
                            aria-label="Cancelar edición"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`${styles.roleBadge} ${
                            user.role === "super_admin"
                              ? styles.roleSuperAdmin
                              : user.role === "admin"
                              ? styles.roleAdmin
                              : styles.roleUser
                          }`}
                        >
                          {user.role === "super_admin"
                            ? "Super Admin"
                            : user.role === "admin"
                            ? "Admin"
                            : "User"}
                        </span>
                      )}
                    </td>

                    <td>
                      <div className={styles.planCell}>
                        <span className={`${styles.planBadge} ${planClass(user.subscription?.plan ?? "FREE")}`}>
                          {user.subscription?.plan ?? "FREE"}
                        </span>
                        {user.subscription && (
                          <span className={`${styles.statusDot} ${statusClass(user.subscription.status)}`}
                            title={user.subscription.status}
                            aria-label={`Estado: ${user.subscription.status}`}
                          />
                        )}
                      </div>
                    </td>

                    <td className={styles.hideOnTablet}>
                      <span className={styles.dateText}>{formatDate(user.createdAt)}</span>
                    </td>

                    <td>
                      {editingId !== user.id && (
                        <button
                          className={styles.editRoleBtn}
                          onClick={() => {
                            setEditingId(user.id);
                            setEditingRole(user.role);
                            setRoleError(null);
                          }}
                          aria-label={`Editar rol de ${user.name ?? user.email}`}
                        >
                          ✏️ Rol
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────── */}
      {data && data.totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Paginación">
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            ← Anterior
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
              const num = Math.min(
                Math.max(page - 2 + i, 1),
                data.totalPages,
              );
              return (
                <button
                  key={num}
                  className={`${styles.pageNumber} ${num === page ? styles.pageNumberActive : ""}`}
                  onClick={() => setPage(num)}
                  aria-label={`Página ${num}`}
                  aria-current={num === page ? "page" : undefined}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            aria-label="Página siguiente"
          >
            Siguiente →
          </button>
        </nav>
      )}
    </div>
  );
}
