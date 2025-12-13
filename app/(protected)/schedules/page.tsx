'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCourses } from '@/modules/courses/actions';
import { getTeachers } from '@/modules/teachers/actions';
import { ScheduleGrid } from '@/modules/schedules/components/ScheduleGridSimple';
import '../../schools.css';
import '../../schedules.css';
import '../../schedule-grid.css';
import '../../schedule-accordion.css';

type ScheduleView = 'course' | 'teacher';

export default function SchedulesPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<ScheduleView>('course');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, teachersData] = await Promise.all([
          getCourses(),
          getTeachers()
        ]);
        setCourses(coursesData);
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDownload = (name: string) => {
    console.log(`Descargando horario de: ${name}`);
    alert(`Función de descarga en desarrollo para: ${name}`);
  };

  const handleEdit = (id: string, type: 'course' | 'teacher') => {
    router.push(`/schedules/editor?id=${id}&type=${type}`);
  };

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
          </div>
          <p className="schools-description">
            Visualiza y gestiona los horarios semanales de cursos y profesores.
          </p>
        </header>

        {/* Pestañas de visualización */}
        <div className="schedule-tabs">
          <button
            className={`schedule-tab ${activeView === 'course' ? 'active' : ''}`}
            onClick={() => setActiveView('course')}
          >
            <span className="schedule-tab-icon">🎓</span>
            <span className="schedule-tab-text">Por Curso</span>
          </button>
          <button
            className={`schedule-tab ${activeView === 'teacher' ? 'active' : ''}`}
            onClick={() => setActiveView('teacher')}
          >
            <span className="schedule-tab-icon">👨‍🏫</span>
            <span className="schedule-tab-text">Por Profesor</span>
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="schools-empty">
            <div className="schools-empty-icon">⏳</div>
            <p className="schools-empty-title">Cargando horarios...</p>
          </div>
        ) : (
          <>
            {/* Empty state */}
            {((activeView === 'course' && courses.length === 0) || 
              (activeView === 'teacher' && teachers.length === 0)) && (
              <div className="schools-empty">
                <div className="schools-empty-icon">
                  {activeView === 'course' ? '🎓' : '👨‍🏫'}
                </div>
                <p className="schools-empty-title">
                  {activeView === 'course' 
                    ? 'No hay cursos registrados' 
                    : 'No hay profesores registrados'}
                </p>
                <p className="schools-empty-subtitle">
                  {activeView === 'course'
                    ? 'Primero debes crear cursos para gestionar sus horarios'
                    : 'Primero debes crear profesores para gestionar sus horarios'}
                </p>
              </div>
            )}

            {/* Accordion list */}
            {((activeView === 'course' && courses.length > 0) || 
              (activeView === 'teacher' && teachers.length > 0)) && (
              <div className="schedule-accordion-container">
                {activeView === 'course'
                  ? courses.map((course) => (
                      <div key={course.id} className="schedule-accordion-item">
                        <div
                          className="schedule-accordion-header"
                          onClick={() => toggleExpand(course.id)}
                        >
                          <div className="schedule-accordion-info">
                            <div className="schedule-accordion-icon">🎓</div>
                            <div>
                              <h3 className="schedule-accordion-title">
                                {course.name}
                              </h3>
                              <p className="schedule-accordion-subtitle">
                                {course.school.name} • {course.studentCount || 0} estudiantes
                              </p>
                            </div>
                          </div>
                          <div className="schedule-accordion-actions">
                            <button
                              className="schedule-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(course.name);
                              }}
                              title="Descargar horario"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                            <button
                              className="schedule-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(course.id, 'course');
                              }}
                              title="Editar horario"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button className="schedule-accordion-toggle">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                  transform:
                                    expandedId === course.id
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                        {expandedId === course.id && (
                          <div className="schedule-accordion-content">
                            {course.schedules && course.schedules.length > 0 ? (
                              <ScheduleGrid blocks={course.schedules[0].blocks || []} type="course" />
                            ) : (
                              <div style={{ 
                                padding: '2rem', 
                                textAlign: 'center', 
                                color: 'rgba(255, 255, 255, 0.6)' 
                              }}>
                                Este curso aún no tiene horario asignado
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  : teachers.map((teacher) => (
                      <div key={teacher.id} className="schedule-accordion-item">
                        <div
                          className="schedule-accordion-header"
                          onClick={() => toggleExpand(teacher.id)}
                        >
                          <div className="schedule-accordion-info">
                            <div className="schedule-accordion-icon">👨‍🏫</div>
                            <div>
                              <h3 className="schedule-accordion-title">
                                {teacher.firstName} {teacher.lastName}
                              </h3>
                              <p className="schedule-accordion-subtitle">
                                {teacher.specialization || 'Sin especialización'} • {teacher.email}
                              </p>
                            </div>
                          </div>
                          <div className="schedule-accordion-actions">
                            <button
                              className="schedule-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(`${teacher.firstName} ${teacher.lastName}`);
                              }}
                              title="Descargar horario"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                            </button>
                            <button
                              className="schedule-action-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(teacher.id, 'teacher');
                              }}
                              title="Editar horario"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button className="schedule-accordion-toggle">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                  transform:
                                    expandedId === teacher.id
                                      ? "rotate(180deg)"
                                      : "rotate(0deg)",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          </div>
                        </div>
                        {expandedId === teacher.id && (
                          <div className="schedule-accordion-content">
                            <div style={{ 
                              padding: '2rem', 
                              textAlign: 'center', 
                              color: 'rgba(255, 255, 255, 0.6)' 
                            }}>
                              Este profesor aún no tiene horario asignado
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
