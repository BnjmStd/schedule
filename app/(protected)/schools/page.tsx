"use client";

import { useEffect, useState } from "react";
import { getSchools, updateSchool } from "@/modules/schools/actions";
import {
  AcademicLevelScheduleConfig,
  ActiveAcademicLevelsConfig,
} from "@/modules/schools/components";
import { Input } from "@/components/ui";
import type { School } from "@/types";
import styles from "./schools.module.css";

export default function SchoolsPage() {
  const [school, setSchool] = useState<School | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    loadSchool();
  }, []);

  const loadSchool = async () => {
    setIsLoading(true);
    const schools = await getSchools();
    const s = schools[0] || null;
    setSchool(s);
    if (s) {
      setForm({
        name: s.name,
        address: s.address,
        phone: s.phone || "",
        email: s.email || "",
      });
    }
    setIsLoading(false);
  };

  const handleEditStart = () => {
    if (school) {
      setForm({
        name: school.name,
        address: school.address,
        phone: school.phone || "",
        email: school.email || "",
      });
    }
    setEditError("");
    setEditing(true);
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditError("");
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditError("");
    setSaving(true);
    try {
      await updateSchool({
        id: school!.id,
        name: form.name,
        address: form.address,
        phone: form.phone || undefined,
        email: form.email || undefined,
      });
      setEditing(false);
      await loadSchool();
    } catch (err) {
      setEditError(
        err instanceof Error ? err.message : "Error al actualizar el colegio",
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles["schools-page"]}>
        <div className={styles["schools-bg"]}>
          <div className={styles["schools-gradient"]} />
        </div>
        <div className={styles["schools-container"]}>
          <div className={styles["schools-empty"]}>
            <div className={styles["schools-empty-icon"]}>⏳</div>
            <p className={styles["schools-empty-title"]}>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className={styles["schools-page"]}>
        <div className={styles["schools-bg"]}>
          <div className={styles["schools-gradient"]} />
        </div>
        <div className={styles["schools-container"]}>
          <div className={styles["schools-empty"]}>
            <div className={styles["schools-empty-icon"]}>🏫</div>
            <p className={styles["schools-empty-title"]}>
              No hay colegio registrado
            </p>
            <p className={styles["schools-empty-subtitle"]}>
              El colegio se crea durante el proceso de registro.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["schools-page"]}>
      <div className={styles["schools-bg"]}>
        <div className={styles["schools-gradient"]} />
      </div>

      <div className={styles["schools-container"]}>
        {/* Page header */}
        <header className={styles["schools-header"]}>
          <h1 className={styles["schools-title"]}>🏫 Mi Colegio</h1>
          <p className={styles["schools-description"]}>
            Información y configuración de tu institución educativa.
          </p>
        </header>

        {/* ── Información del colegio ── */}
        <section className={styles["school-section"]}>
          {editing ? (
            <form
              onSubmit={handleEditSubmit}
              className={styles["school-edit-form"]}
            >
              <div className={styles["school-edit-form-header"]}>
                <h2 className={styles["school-section-title"]}>
                  ✏️ Editar Información del Colegio
                </h2>
              </div>

              {editError && (
                <div className={styles["school-edit-error"]}>{editError}</div>
              )}

              <div className={styles["school-edit-fields"]}>
                <div className={styles["school-edit-field"]}>
                  <label
                    htmlFor="edit-name"
                    className={styles["school-edit-label"]}
                  >
                    Nombre del Colegio{" "}
                    <span className={styles["required"]}>*</span>
                  </label>
                  <Input
                    id="edit-name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    disabled={saving}
                    placeholder="Nombre del colegio"
                  />
                </div>

                <div className={styles["school-edit-field"]}>
                  <label
                    htmlFor="edit-address"
                    className={styles["school-edit-label"]}
                  >
                    Dirección <span className={styles["required"]}>*</span>
                  </label>
                  <Input
                    id="edit-address"
                    name="address"
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                    required
                    disabled={saving}
                    placeholder="Av. Principal 123, Santiago"
                  />
                </div>

                <div className={styles["school-edit-row"]}>
                  <div className={styles["school-edit-field"]}>
                    <label
                      htmlFor="edit-phone"
                      className={styles["school-edit-label"]}
                    >
                      Teléfono
                    </label>
                    <Input
                      id="edit-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      disabled={saving}
                      placeholder="+56 2 2345 6789"
                    />
                  </div>

                  <div className={styles["school-edit-field"]}>
                    <label
                      htmlFor="edit-email"
                      className={styles["school-edit-label"]}
                    >
                      Email
                    </label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      disabled={saving}
                      placeholder="contacto@colegio.cl"
                    />
                  </div>
                </div>
              </div>

              <div className={styles["school-edit-actions"]}>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  disabled={saving}
                  className={styles["school-btn-secondary"]}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={styles["school-btn-primary"]}
                >
                  {saving ? "Guardando..." : "💾 Guardar cambios"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles["school-info-card"]}>
              <div className={styles["school-info-top"]}>
                <div>
                  <span className={styles["school-info-badge"]}>Activo</span>
                  <h2 className={styles["school-info-name"]}>{school.name}</h2>
                </div>
                <button
                  onClick={handleEditStart}
                  className={styles["school-edit-btn"]}
                >
                  ✏️ Editar información
                </button>
              </div>

              <div className={styles["school-info-details"]}>
                <div className={styles["school-info-detail"]}>
                  <span className={styles["school-info-detail-icon"]}>📍</span>
                  <span>{school.address}</span>
                </div>
                {school.phone && (
                  <div className={styles["school-info-detail"]}>
                    <span className={styles["school-info-detail-icon"]}>
                      📞
                    </span>
                    <span>{school.phone}</span>
                  </div>
                )}
                {school.email && (
                  <div className={styles["school-info-detail"]}>
                    <span className={styles["school-info-detail-icon"]}>
                      ✉️
                    </span>
                    <span>{school.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ── Niveles académicos ── */}
        <section className={styles["school-section"]}>
          <div className={styles["school-section-header"]}>
            <h2 className={styles["school-section-title"]}>
              🎓 Niveles Académicos
            </h2>
            <p className={styles["school-section-desc"]}>
              Selecciona los niveles académicos que ofrece tu colegio. Esto
              determina las opciones disponibles al crear cursos y horarios.
            </p>
          </div>
          <div className={styles["school-section-body"]}>
            <ActiveAcademicLevelsConfig schoolId={school.id} />
          </div>
        </section>

        {/* ── Configuración de jornadas ── */}
        <section className={styles["school-section"]}>
          <div className={styles["school-section-header"]}>
            <h2 className={styles["school-section-title"]}>
              ⏰ Configuración de Jornadas
            </h2>
            <p className={styles["school-section-desc"]}>
              Define el horario de inicio, término, duración de bloques y
              recreos para cada nivel académico.
            </p>
          </div>
          <div className={styles["school-section-body"]}>
            <AcademicLevelScheduleConfig
              schoolId={school.id}
              schoolName={school.name}
              inline
            />
          </div>
        </section>
      </div>
    </div>
  );
}
