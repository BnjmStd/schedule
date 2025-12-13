'use client';

import { useState } from 'react';
import { ScheduleGrid } from '@/modules/schedules/components/ScheduleGridSimple';
import '../../schools.css';
import '../../schedules.css';
import '../../schedule-grid.css';

// 🧪 Datos Mock para pruebas
const MOCK_COURSE_SCHEDULE = {
  id: '1',
  name: '5° Básico A',
  blocks: [
    // Lunes
    { day: 'MONDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', teacher: 'María González', color: '#B4D7FF' },
    { day: 'MONDAY', startTime: '10:00', endTime: '11:00', subject: 'Lenguaje', teacher: 'Pedro Ruiz', color: '#FFB4D7' },
    { day: 'MONDAY', startTime: '11:00', endTime: '12:00', subject: 'Ciencias', teacher: 'Ana López', color: '#FFFBB4' },
    { day: 'MONDAY', startTime: '12:00', endTime: '13:00', subject: 'Historia', teacher: 'Carlos Díaz', color: '#FFD7B4' },
    { day: 'MONDAY', startTime: '14:00', endTime: '15:00', subject: 'Inglés', teacher: 'Laura Martínez', color: '#D7B4FF' },
    { day: 'MONDAY', startTime: '15:00', endTime: '16:00', subject: 'Ed. Física', teacher: 'Roberto Silva', color: '#B4FFD7' },
    
    // Martes
    { day: 'TUESDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', teacher: 'María González', color: '#B4D7FF' },
    { day: 'TUESDAY', startTime: '10:00', endTime: '11:00', subject: 'Lenguaje', teacher: 'Pedro Ruiz', color: '#FFB4D7' },
    { day: 'TUESDAY', startTime: '11:00', endTime: '12:00', subject: 'Inglés', teacher: 'Laura Martínez', color: '#D7B4FF' },
    { day: 'TUESDAY', startTime: '12:00', endTime: '13:00', subject: 'Artes', teacher: 'Sofía Torres', color: '#FFB4E5' },
    { day: 'TUESDAY', startTime: '14:00', endTime: '15:00', subject: 'Ciencias', teacher: 'Ana López', color: '#FFFBB4' },
    { day: 'TUESDAY', startTime: '15:00', endTime: '16:00', subject: 'Música', teacher: 'Diego Vargas', color: '#B4FFEB' },
    
    // Miércoles
    { day: 'WEDNESDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', teacher: 'María González', color: '#B4D7FF' },
    { day: 'WEDNESDAY', startTime: '10:00', endTime: '11:00', subject: 'Historia', teacher: 'Carlos Díaz', color: '#FFD7B4' },
    { day: 'WEDNESDAY', startTime: '11:00', endTime: '12:00', subject: 'Lenguaje', teacher: 'Pedro Ruiz', color: '#FFB4D7' },
    { day: 'WEDNESDAY', startTime: '12:00', endTime: '13:00', subject: 'Ciencias', teacher: 'Ana López', color: '#FFFBB4' },
    { day: 'WEDNESDAY', startTime: '14:00', endTime: '15:00', subject: 'Ed. Física', teacher: 'Roberto Silva', color: '#B4FFD7' },
    { day: 'WEDNESDAY', startTime: '15:00', endTime: '16:00', subject: 'Inglés', teacher: 'Laura Martínez', color: '#D7B4FF' },
    
    // Jueves
    { day: 'THURSDAY', startTime: '09:00', endTime: '10:00', subject: 'Lenguaje', teacher: 'Pedro Ruiz', color: '#FFB4D7' },
    { day: 'THURSDAY', startTime: '10:00', endTime: '11:00', subject: 'Matemáticas', teacher: 'María González', color: '#B4D7FF' },
    { day: 'THURSDAY', startTime: '11:00', endTime: '12:00', subject: 'Inglés', teacher: 'Laura Martínez', color: '#D7B4FF' },
    { day: 'THURSDAY', startTime: '12:00', endTime: '13:00', subject: 'Artes', teacher: 'Sofía Torres', color: '#FFB4E5' },
    { day: 'THURSDAY', startTime: '14:00', endTime: '15:00', subject: 'Historia', teacher: 'Carlos Díaz', color: '#FFD7B4' },
    { day: 'THURSDAY', startTime: '15:00', endTime: '16:00', subject: 'Ciencias', teacher: 'Ana López', color: '#FFFBB4' },
    
    // Viernes
    { day: 'FRIDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', teacher: 'María González', color: '#B4D7FF' },
    { day: 'FRIDAY', startTime: '10:00', endTime: '11:00', subject: 'Ed. Física', teacher: 'Roberto Silva', color: '#B4FFD7' },
    { day: 'FRIDAY', startTime: '11:00', endTime: '12:00', subject: 'Lenguaje', teacher: 'Pedro Ruiz', color: '#FFB4D7' },
    { day: 'FRIDAY', startTime: '12:00', endTime: '13:00', subject: 'Música', teacher: 'Diego Vargas', color: '#B4FFEB' },
    { day: 'FRIDAY', startTime: '14:00', endTime: '15:00', subject: 'Ciencias', teacher: 'Ana López', color: '#FFFBB4' },
    { day: 'FRIDAY', startTime: '15:00', endTime: '16:00', subject: 'Inglés', teacher: 'Laura Martínez', color: '#D7B4FF' },
  ]
};

const MOCK_TEACHER_SCHEDULE = {
  id: '1',
  name: 'María González',
  specialization: 'Matemáticas',
  blocks: [
    // Lunes
    { day: 'MONDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', course: '5° Básico A', color: '#B4D7FF' },
    { day: 'MONDAY', startTime: '10:00', endTime: '11:00', subject: 'Matemáticas', course: '5° Básico B', color: '#B4E0FF' },
    { day: 'MONDAY', startTime: '14:00', endTime: '15:00', subject: 'Matemáticas', course: '6° Básico A', color: '#B4EAFF' },
    
    // Martes
    { day: 'TUESDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', course: '5° Básico A', color: '#B4D7FF' },
    { day: 'TUESDAY', startTime: '11:00', endTime: '12:00', subject: 'Matemáticas', course: '6° Básico B', color: '#B4F4FF' },
    { day: 'TUESDAY', startTime: '15:00', endTime: '16:00', subject: 'Matemáticas', course: '5° Básico C', color: '#B4CCFF' },
    
    // Miércoles
    { day: 'WEDNESDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', course: '5° Básico A', color: '#B4D7FF' },
    { day: 'WEDNESDAY', startTime: '10:00', endTime: '11:00', subject: 'Matemáticas', course: '6° Básico A', color: '#B4EAFF' },
    { day: 'WEDNESDAY', startTime: '14:00', endTime: '15:00', subject: 'Matemáticas', course: '5° Básico B', color: '#B4E0FF' },
    
    // Jueves
    { day: 'THURSDAY', startTime: '10:00', endTime: '11:00', subject: 'Matemáticas', course: '5° Básico A', color: '#B4D7FF' },
    { day: 'THURSDAY', startTime: '11:00', endTime: '12:00', subject: 'Matemáticas', course: '5° Básico C', color: '#B4CCFF' },
    { day: 'THURSDAY', startTime: '15:00', endTime: '16:00', subject: 'Matemáticas', course: '6° Básico B', color: '#B4F4FF' },
    
    // Viernes
    { day: 'FRIDAY', startTime: '09:00', endTime: '10:00', subject: 'Matemáticas', course: '5° Básico A', color: '#B4D7FF' },
    { day: 'FRIDAY', startTime: '10:00', endTime: '11:00', subject: 'Matemáticas', course: '6° Básico A', color: '#B4EAFF' },
    { day: 'FRIDAY', startTime: '14:00', endTime: '15:00', subject: 'Matemáticas', course: '5° Básico B', color: '#B4E0FF' },
  ]
};

type ScheduleViewType = 'course' | 'teacher';

export default function ExperimentalPage() {
  const [viewType, setViewType] = useState<ScheduleViewType>('course');

  return (
    <div className="schools-page">
      <div className="schools-bg">
        <div className="schools-gradient" />
      </div>
      
      <div className="schools-container">
        <header className="schools-header">
          <div className="schools-header-top">
            <h1 className="schools-title">
              🧪 Experimental: Visualización de Horarios
            </h1>
          </div>
          <p className="schools-description">
            Vista previa experimental del sistema de horarios con datos mock
          </p>
        </header>

        {/* Pestañas de tipo de horario */}
        <div className="schedule-tabs">
          <button
            className={`schedule-tab ${viewType === 'course' ? 'active' : ''}`}
            onClick={() => setViewType('course')}
          >
            <span className="schedule-tab-icon">🎓</span>
            <span className="schedule-tab-text">Horario de Curso</span>
          </button>
          <button
            className={`schedule-tab ${viewType === 'teacher' ? 'active' : ''}`}
            onClick={() => setViewType('teacher')}
          >
            <span className="schedule-tab-icon">👨‍🏫</span>
            <span className="schedule-tab-text">Horario de Profesor</span>
          </button>
        </div>

        {/* Visualización del horario según el tipo */}
        {viewType === 'course' ? (
          <div className="schedule-view">
            <div className="schedule-view-header">
              <h2 className="schedule-view-title">🎓 {MOCK_COURSE_SCHEDULE.name}</h2>
              <p className="schedule-view-subtitle">Horario Semanal del Curso</p>
            </div>
            <ScheduleGrid 
              blocks={MOCK_COURSE_SCHEDULE.blocks}
              type="course"
            />
          </div>
        ) : (
          <div className="schedule-view">
            <div className="schedule-view-header">
              <h2 className="schedule-view-title">👨‍🏫 {MOCK_TEACHER_SCHEDULE.name}</h2>
              <p className="schedule-view-subtitle">{MOCK_TEACHER_SCHEDULE.specialization}</p>
            </div>
            <ScheduleGrid 
              blocks={MOCK_TEACHER_SCHEDULE.blocks}
              type="teacher"
            />
          </div>
        )}
      </div>
    </div>
  );
}
