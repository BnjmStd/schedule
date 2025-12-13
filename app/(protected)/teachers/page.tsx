'use client';

import { useEffect, useState } from 'react';
import { getTeachers } from '@/modules/teachers/actions';
import { getSchools } from '@/modules/schools/actions';
import { AddTeacherButton } from '@/modules/teachers/components/AddTeacherButton';
import type { School } from '@/types';
import '../../teachers.css';

type Teacher = Awaited<ReturnType<typeof getTeachers>>[0];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [teachersData, schoolsData] = await Promise.all([
        getTeachers(),
        getSchools()
      ]);
      setTeachers(teachersData);
      setSchools(schoolsData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const filteredTeachers = selectedSchool === 'all' 
    ? teachers 
    : teachers.filter(t => t.schoolId === selectedSchool);

  if (isLoading) {
    return (
      <div className="schools-page">
        <div className="schools-bg">
          <div className="schools-gradient" />
        </div>
        <div className="schools-container">
          <div className="schools-empty">
            <div className="schools-empty-icon">⏳</div>
            <p className="schools-empty-title">Cargando profesores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="schools-page">
      <div className="schools-bg">
        <div className="schools-gradient" />
      </div>
      
      <div className="schools-container">
        <header className="schools-header">
          <div className="schools-header-top">
            <h1 className="schools-title">
              👨‍🏫 Profesores
            </h1>
            <div className="schools-header-actions">
              <button 
                className="schools-filter-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                Filtros
              </button>
              <AddTeacherButton />
            </div>
          </div>
          <p className="schools-description">
            Administra los profesores, su disponibilidad horaria y las asignaturas que pueden dictar.
          </p>
        </header>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="schools-filters">
            <div className="schools-filter-group">
              <label className="schools-filter-label">Filtrar por Colegio</label>
              <select 
                className="schools-filter-select"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
              >
                <option value="all">Todos los colegios ({teachers.length})</option>
                {schools.map(school => {
                  const count = teachers.filter(t => t.schoolId === school.id).length;
                  return (
                    <option key={school.id} value={school.id}>
                      {school.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
            {selectedSchool !== 'all' && (
              <button 
                className="schools-filter-clear"
                onClick={() => setSelectedSchool('all')}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {filteredTeachers.length === 0 ? (
          <div className="schools-empty">
            <div className="schools-empty-icon">👨‍🏫</div>
            <p className="schools-empty-title">
              {selectedSchool === 'all' 
                ? 'No hay profesores registrados' 
                : 'No hay profesores en este colegio'}
            </p>
            <p className="schools-empty-subtitle">
              {selectedSchool === 'all'
                ? 'Comienza agregando tu primer profesor'
                : 'Intenta con otro colegio o limpia los filtros'}
            </p>
          </div>
        ) : (
          <div className="schools-grid">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="schools-card">
                <div className="schools-card-header">
                  <div>
                    <h3 className="schools-card-title">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <span className="schools-card-school-badge">
                      🏫 {teacher.school.name}
                    </span>
                  </div>
                  <span className="schools-card-badge">
                    {teacher.specialization || 'Profesor'}
                  </span>
                </div>
                
                <div className="schools-card-info">
                  <div className="schools-card-info-item">
                    <span className="schools-card-info-icon">✉️</span>
                    <span>{teacher.email}</span>
                  </div>
                  {teacher.phone && (
                    <div className="schools-card-info-item">
                      <span className="schools-card-info-icon">📞</span>
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                  {teacher.teacherSubjects.length > 0 && (
                    <div className="schools-card-info-item">
                      <span className="schools-card-info-icon">📚</span>
                      <span>{teacher.teacherSubjects.length} asignatura{teacher.teacherSubjects.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                
                <div className="schools-card-footer">
                  <button className="schools-card-btn schools-card-btn-primary">
                    Ver Detalles
                  </button>
                  <button className="schools-card-btn schools-card-btn-ghost">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface DemoTeacherCardProps {
  name: string;
  email: string;
  subjects: string[];
  availability: string;
}

function DemoTeacherCard({
  name,
  email,
  subjects,
  availability,
}: DemoTeacherCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-neutral-900 mb-1">{name}</h3>
            <p className="text-sm text-neutral-600 mb-3">{email}</p>

            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-neutral-700">
                  Asignaturas:
                </span>
                <div className="flex gap-2 mt-1">
                  {subjects.map((subject) => (
                    <Badge key={subject} variant="accent">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-neutral-700">
                  Disponibilidad:
                </span>
                <p className="text-sm text-neutral-600 mt-1">{availability}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              Editar
            </Button>
            <Button variant="primary" size="sm">
              Ver Horario
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
