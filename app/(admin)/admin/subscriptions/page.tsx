"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./page.module.css";

// ── Types ─────────────────────────────────────────────────────

interface SubRow {
  id: string;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  stripeCustomerId: string | null;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    _count: { schools: number };
  };
}

interface SubsResponse {
  subscriptions: SubRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PLANS = ["FREE", "PRO", "ENTERPRISE"] as const;
const STATUSES = [
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
  "INCOMPLETE",
] as const;

// ── Helpers ───────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CL", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function planClass(plan: string): string {
  if (plan === "PRO") return styles.planPro;
  if (plan === "ENTERPRISE") return styles.planEnt;
  return styles.planFree;
}

function statusClass(status: string): string {
  if (status === "ACTIVE") return styles.statusActive;
  if (status === "TRIALING") return styles.statusTrialing;
  if (status === "PAST_DUE") return styles.statusPastDue;
  if (status === "CANCELED") return styles.statusCanceled;
  if (status === "EXPIRED") return styles.statusExpired;
  return styles.statusNeutral;
}

// ── Component ─────────────────────────────────────────────────

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<SubsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Debounce
  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchSubs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "20",
      ...(searchDebounced ? { search: searchDebounced } : {}),
      ...(planFilter ? { plan: planFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    });

    fetch(`/api/admin/subscriptions?${params}`)
      .then((r) => r.json() as Promise<SubsResponse>)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, searchDebounced, planFilter, statusFilter]);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  useEffect(() => {
    setPage(1);
  }, [searchDebounced, planFilter, statusFilter]);

  function startEdit(sub: SubRow) {
    setEditingId(sub.id);
    setEditPlan(sub.plan);
    setEditStatus(sub.status);
    setEditReason("");
    setError(null);
    setSuccessMsg(null);
  }

  async function saveEdit(userId: string, userName: string) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          plan: editPlan,
          status: editStatus,
          reason: editReason || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Error al guardar");
        return;
      }
      setEditingId(null);
      setSuccessMsg(`Suscripción de ${userName ?? "usuario"} actualizada.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchSubs();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      {/* ── Filters ─────────────────────────────────────────── */}
      <div
        className={styles.filters}
        role="search"
        aria-label="Filtros de suscripciones"
      >
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar suscripciones"
        />
        <select
          className={styles.filterSelect}
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          aria-label="Filtrar por plan"
        >
          <option value="">Todos los planes</option>
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filtrar por estado"
        >
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {data && (
          <span className={styles.resultCount} aria-live="polite">
            {data.total} resultado{data.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Feedback banners ──────────────────────────────────── */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          ⚠️ {error}
          <button className={styles.dismissBtn} onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}
      {successMsg && (
        <div className={styles.successBanner} role="status">
          ✅ {successMsg}
        </div>
      )}

      {/* ── Table / Cards ─────────────────────────────────────── */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingRow} aria-busy="true">
            <div className={styles.spinner} />
            <span>Cargando suscripciones…</span>
          </div>
        ) : data?.subscriptions.length === 0 ? (
          <div className={styles.emptyState} role="status">
            <span aria-hidden="true">💳</span>
            <p>No se encontraron suscripciones con esos filtros.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Usuario</th>
                  <th scope="col">Plan</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className={styles.hideOnMobile}>
                    Expira
                  </th>
                  <th scope="col" className={styles.hideOnMobile}>
                    Colegios
                  </th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data?.subscriptions.map((sub) => (
                  <tr
                    key={sub.id}
                    className={`${styles.tableRow} ${editingId === sub.id ? styles.rowEditing : ""}`}
                  >
                    {/* Usuario */}
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} aria-hidden="true">
                          {(sub.user.name ?? sub.user.email)
                            .substring(0, 2)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.userName}>
                            {sub.user.name ?? "—"}
                          </div>
                          <div className={styles.userEmail}>
                            {sub.user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td>
                      {editingId === sub.id ? (
                        <select
                          className={styles.inlineSelect}
                          value={editPlan}
                          onChange={(e) => setEditPlan(e.target.value)}
                          aria-label="Seleccionar plan"
                        >
                          {PLANS.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`${styles.planBadge} ${planClass(sub.plan)}`}
                        >
                          {sub.plan}
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td>
                      {editingId === sub.id ? (
                        <select
                          className={styles.inlineSelect}
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          aria-label="Seleccionar estado"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={`${styles.statusBadge} ${statusClass(sub.status)}`}
                        >
                          {sub.status}
                        </span>
                      )}
                    </td>

                    {/* Expira */}
                    <td className={styles.hideOnMobile}>
                      <span className={styles.dateText}>
                        {formatDate(sub.currentPeriodEnd)}
                      </span>
                    </td>

                    {/* Colegios */}
                    <td className={styles.hideOnMobile}>
                      <span className={styles.countBadge}>
                        {sub.user._count.schools}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      {editingId === sub.id ? (
                        <div className={styles.editActions}>
                          <input
                            type="text"
                            className={styles.reasonInput}
                            placeholder="Motivo (opcional)"
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                            aria-label="Motivo del cambio"
                          />
                          <div className={styles.editBtns}>
                            <button
                              className={styles.saveBtn}
                              onClick={() =>
                                saveEdit(
                                  sub.user.id,
                                  sub.user.name ?? sub.user.email,
                                )
                              }
                              disabled={saving}
                              aria-label="Guardar cambios"
                            >
                              {saving ? "…" : "Guardar"}
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={() => setEditingId(null)}
                              aria-label="Cancelar"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className={styles.editBtn}
                          onClick={() => startEdit(sub)}
                          aria-label={`Editar suscripción de ${sub.user.name ?? sub.user.email}`}
                        >
                          ✏️ Editar
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
          >
            ← Anterior
          </button>
          <span className={styles.pageInfo}>
            Página {page} de {data.totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Siguiente →
          </button>
        </nav>
      )}
    </div>
  );
}
