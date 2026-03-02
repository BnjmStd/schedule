/**
 * 🤖 Modal para Generación Automática de Horarios
 */

"use client";

import { useState, useEffect } from "react";
import { generateAndSaveSchedule } from "@/modules/schedules/actions";
import { getSubjects } from "@/modules/subjects/actions";
import type { ScheduleGenerationConfig } from "@/modules/schedules/types";
import "./GenerateScheduleModal.css";

interface GenerateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  schoolId: string;
  onSuccess?: () => void;
}

interface SubjectConfig {
  subjectId: string;
  subjectName: string;
  hoursPerWeek: number;
}

export function GenerateScheduleModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  schoolId,
  onSuccess,
}: GenerateScheduleModalProps) {
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectConfig[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSubjects();
    }
  }, [isOpen, schoolId]);

  const loadSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const subjects = await getSubjects();
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error("Error cargando asignaturas:", error);
      alert("Error al cargar las asignaturas");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleAddSubject = () => {
    if (availableSubjects.length === 0) return;

    // Agregar la primera asignatura que no esté seleccionada
    const unselected = availableSubjects.find(
      (s) => !selectedSubjects.some((sel) => sel.subjectId === s.id),
    );

    if (unselected) {
      setSelectedSubjects([
        ...selectedSubjects,
        {
          subjectId: unselected.id,
          subjectName: unselected.name,
          hoursPerWeek: 2, // Default: 2 horas por semana
        },
      ]);
    }
  };

  const handleRemoveSubject = (index: number) => {
    setSelectedSubjects(selectedSubjects.filter((_, i) => i !== index));
  };

  const handleSubjectChange = (
    index: number,
    field: "subjectId" | "hoursPerWeek",
    value: string | number,
  ) => {
    const updated = [...selectedSubjects];

    if (field === "subjectId") {
      const subject = availableSubjects.find((s) => s.id === value);
      if (subject) {
        updated[index] = {
          ...updated[index],
          subjectId: subject.id,
          subjectName: subject.name,
        };
      }
    } else {
      updated[index] = {
        ...updated[index],
        [field]: Number(value),
      };
    }

    setSelectedSubjects(updated);
  };

  const handleGenerate = async () => {
    if (selectedSubjects.length === 0) {
      alert("⚠️ Debes agregar al menos una asignatura");
      return;
    }

    const totalHours = selectedSubjects.reduce(
      (sum, s) => sum + s.hoursPerWeek,
      0,
    );

    if (totalHours === 0) {
      alert("⚠️ Debes configurar al menos 1 hora para alguna asignatura");
      return;
    }

    setLoading(true);
    try {
      const config: ScheduleGenerationConfig = {
        courseId,
        academicYear: new Date().getFullYear(),
        subjects: selectedSubjects,
        constraints: {
          avoidConsecutiveBlocks: true, // Evitar bloques consecutivos de la misma asignatura
        },
      };

      console.log("[GenerateScheduleModal] Configuración:", config);

      const result = await generateAndSaveSchedule(config);

      console.log("[GenerateScheduleModal] Resultado:", result);

      if (result.success) {
        const warningsMsg =
          result.warnings && result.warnings.length > 0
            ? `\n\n⚠️ Advertencias:\n${result.warnings.join("\n")}`
            : "";

        const statsMsg = result.stats
          ? `\n\n📊 Estadísticas:
- Bloques creados: ${result.stats.totalBlocks}
- Profesores asignados: ${result.stats.teachersUsed}
- Cobertura total: ${result.stats.coveragePercentage}%

Cobertura por asignatura:
${result.stats.subjectsCoverage
  .map(
    (sc) =>
      `  • ${sc.subject}: ${sc.assigned}/${sc.required} horas (${sc.percentage}%)`,
  )
  .join("\n")}`
          : "";

        alert(
          `✅ ¡Horario generado exitosamente!${statsMsg}${warningsMsg}\n\nPuedes editarlo en el editor de horarios.`,
        );

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        const errorMsg = result.errors?.join("\n") || "Error desconocido";
        alert(`❌ No se pudo generar el horario:\n\n${errorMsg}`);
      }
    } catch (error) {
      console.error("[GenerateScheduleModal] Error:", error);
      alert(
        `❌ Error al generar horario:\n\n${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const totalHours = selectedSubjects.reduce(
    (sum, s) => sum + s.hoursPerWeek,
    0,
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{`🤖 Generar Horario - ${courseName}`}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="generate-schedule-modal">
          <div className="modal-intro">
            <p>
              Configura las asignaturas y horas semanales requeridas. El sistema
              generará automáticamente un horario considerando:
            </p>
            <ul>
              <li>✅ Disponibilidad de profesores</li>
              <li>✅ Prevención de conflictos de horario</li>
              <li>✅ Distribución óptima en la semana</li>
            </ul>
          </div>

          {loadingSubjects ? (
            <div className="loading-subjects">Cargando asignaturas...</div>
          ) : (
            <>
              <div className="subjects-config">
                <div className="subjects-header">
                  <h3>Asignaturas y Horas</h3>
                  <button
                    onClick={handleAddSubject}
                    className="btn-add-subject"
                    disabled={
                      selectedSubjects.length === availableSubjects.length
                    }
                  >
                    ➕ Agregar Asignatura
                  </button>
                </div>

                {selectedSubjects.length === 0 ? (
                  <div className="empty-subjects">
                    <p>
                      📚 No hay asignaturas configuradas. Haz clic en "Agregar
                      Asignatura" para empezar.
                    </p>
                  </div>
                ) : (
                  <div className="subjects-list">
                    {selectedSubjects.map((subject, index) => (
                      <div key={index} className="subject-item">
                        <select
                          value={subject.subjectId}
                          onChange={(e) =>
                            handleSubjectChange(
                              index,
                              "subjectId",
                              e.target.value,
                            )
                          }
                          className="subject-select"
                        >
                          {availableSubjects.map((s) => (
                            <option
                              key={s.id}
                              value={s.id}
                              disabled={selectedSubjects.some(
                                (sel, i) =>
                                  i !== index && sel.subjectId === s.id,
                              )}
                            >
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <div className="hours-input-group">
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={subject.hoursPerWeek}
                            onChange={(e) =>
                              handleSubjectChange(
                                index,
                                "hoursPerWeek",
                                e.target.value,
                              )
                            }
                            className="hours-input"
                          />
                          <span className="hours-label">hrs/semana</span>
                        </div>

                        <button
                          onClick={() => handleRemoveSubject(index)}
                          className="btn-remove-subject"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {totalHours > 0 && (
                  <div className="total-hours">
                    <strong>Total:</strong> {totalHours} horas semanales
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  onClick={handleGenerate}
                  disabled={loading || selectedSubjects.length === 0}
                  className="btn btn-primary"
                >
                  {loading ? "⏳ Generando..." : "🤖 Generar Horario"}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
