/**
 * 🕒 Componente para configurar la jornada escolar del colegio
 */

"use client";

import { useState, useEffect } from "react";
import { getSchoolScheduleConfig, updateSchoolScheduleConfig } from "@/modules/schools/actions";
import "@/app/schedule-editor.css";

interface SchoolScheduleConfigProps {
  schoolId: string;
  schoolName: string;
  onClose: () => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export function SchoolScheduleConfig({
  schoolId,
  schoolName,
  onClose,
}: SchoolScheduleConfigProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    startTime: "09:00",
    endTime: "18:00",
    blockDuration: 60,
    breakDuration: 15,
    lunchBreak: {
      enabled: true,
      startTime: "13:00",
      endTime: "14:00",
    },
  });

  useEffect(() => {
    loadConfig();
  }, [schoolId]);

  const loadConfig = async () => {
    try {
      const data = await getSchoolScheduleConfig(schoolId);
      setConfig(data);
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSchoolScheduleConfig(schoolId, config);
      alert("Configuración guardada exitosamente");
      onClose();
    } catch (error) {
      console.error("Error guardando configuración:", error);
      alert("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="quick-assign-modal-overlay">
        <div className="schedule-config-modal">
          <div className="schedule-config-header">
            <h3>Cargando...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-assign-modal-overlay" onClick={onClose}>
      <div
        className="schedule-config-modal quick-assign-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quick-assign-modal-header">
          <div>
            <h3>⚙️ Configuración de Jornada</h3>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "rgba(255, 255, 255, 0.6)" }}>{schoolName}</p>
          </div>
          <button onClick={onClose} className="quick-assign-modal-close">
            ×
          </button>
        </div>

        <div className="schedule-config-body quick-assign-modal-body">
          <p style={{ marginBottom: "1.5rem", fontSize: "0.9375rem", color: "rgba(255, 255, 255, 0.7)" }}>
            Define el horario base que se aplicará a todos los cursos de este
            colegio. Puedes modificar las horas de inicio y término, la
            duración de los bloques y recreos.
          </p>

          <div className="schedule-config-section">
            <h4 className="schedule-config-section-title">Horario de Jornada</h4>

            <div className="schedule-config-row">
              <div className="quick-assign-form-group">
                <label>Hora de Inicio</label>
                <select
                  value={config.startTime}
                  onChange={(e) =>
                    setConfig({ ...config, startTime: e.target.value })
                  }
                >
                  {TIME_OPTIONS.filter((t) => t < config.endTime).map(
                    (time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="quick-assign-form-group">
                <label>Hora de Término</label>
                <select
                  value={config.endTime}
                  onChange={(e) =>
                    setConfig({ ...config, endTime: e.target.value })
                  }
                >
                  {TIME_OPTIONS.filter((t) => t > config.startTime).map(
                    (time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="schedule-config-section">
            <h4 className="schedule-config-section-title">Duración de Bloques y Recreos</h4>

            <div className="schedule-config-row">
              <div className="quick-assign-form-group">
                <label>Duración de Bloque (minutos)</label>
                <select
                  value={config.blockDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      blockDuration: Number(e.target.value),
                    })
                  }
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                </select>
              </div>

              <div className="quick-assign-form-group">
                <label>Duración de Recreo (minutos)</label>
                <select
                  value={config.breakDuration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      breakDuration: Number(e.target.value),
                    })
                  }
                >
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="schedule-config-section">
            <h4 className="schedule-config-section-title">Recreo de Almuerzo</h4>

            <div className="schedule-config-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={config.lunchBreak.enabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      lunchBreak: {
                        ...config.lunchBreak,
                        enabled: e.target.checked,
                      },
                    })
                  }
                />
                <span>Habilitar recreo de almuerzo</span>
              </label>
            </div>

            {config.lunchBreak.enabled && (
              <div className="schedule-config-row">
                <div className="quick-assign-form-group">
                  <label>Inicio del Almuerzo</label>
                  <select
                    value={config.lunchBreak.startTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lunchBreak: {
                          ...config.lunchBreak,
                          startTime: e.target.value,
                        },
                      })
                    }
                  >
                    {TIME_OPTIONS.filter(
                      (t) =>
                        t >= config.startTime &&
                        t < config.lunchBreak.endTime &&
                        t < config.endTime
                    ).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="quick-assign-form-group">
                  <label>Fin del Almuerzo</label>
                  <select
                    value={config.lunchBreak.endTime}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        lunchBreak: {
                          ...config.lunchBreak,
                          endTime: e.target.value,
                        },
                      })
                    }
                  >
                    {TIME_OPTIONS.filter(
                      (t) =>
                        t > config.lunchBreak.startTime && t <= config.endTime
                    ).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="quick-assign-modal-footer" style={{ padding: "1.5rem" }}>
          <button
            onClick={onClose}
            className="quick-assign-btn secondary"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="quick-assign-btn primary"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}
