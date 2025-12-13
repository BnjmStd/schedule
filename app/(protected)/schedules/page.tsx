'use client';

import { useState } from 'react';
import Link from 'next/link';
import '../../schools.css';
import '../../schedules.css';

type ScheduleView = 'teacher' | 'course';

export default function SchedulesPage() {
  const [activeView, setActiveView] = useState<ScheduleView>('teacher');

  return (
    <div className="schools-page">
      <div className="schools-bg">
        <div className="schools-gradient" />
      </div>
      
      <div className="schools-container">
        <header className="schools-header">
          <div className="schools-header-top">
            <h1 className="schools-title">
              🗓️ Horarios
            </h1>
            <Link href="/schedules/new">
              <button className="schools-add-btn">
                + Crear Horario
              </button>
            </Link>
          </div>
          <p className="schools-description">
            Visualiza y gestiona los horarios semanales con detección automática de conflictos.
          </p>
        </header>

        {/* Pestañas de visualización */}
        <div className="schedule-tabs">
          <button
            className={`schedule-tab ${activeView === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveView('teacher')}
          >
            <span className="schedule-tab-icon">👨‍🏫</span>
            <span className="schedule-tab-text">Por Profesor</span>
          </button>
          <button
            className={`schedule-tab ${activeView === 'course' ? 'active' : ''}`}
            onClick={() => setActiveView('course')}
          >
            <span className="schedule-tab-icon">🎓</span>
            <span className="schedule-tab-text">Por Curso</span>
          </button>
        </div>

        {/* Contenido según la vista seleccionada */}
        <div className="schools-empty">
          <div className="schools-empty-icon">
            {activeView === 'teacher' ? '👨‍🏫' : '🎓'}
          </div>
          <p className="schools-empty-title">
            {activeView === 'teacher' 
              ? 'No hay horarios de profesores' 
              : 'No hay horarios de cursos'}
          </p>
          <p className="schools-empty-subtitle">
            {activeView === 'teacher'
              ? 'Los horarios de profesores mostrarán todas las clases asignadas a cada docente'
              : 'Los horarios de cursos mostrarán la distribución semanal de cada curso'}
          </p>
        </div>
      </div>
    </div>
  );
}
