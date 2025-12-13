import { getCourses } from '@/modules/courses/actions';
import { AddCourseButton } from '@/modules/courses/components/AddCourseButton';
import '../../courses.css';

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="schools-page">
      <div className="schools-bg">
        <div className="schools-gradient" />
      </div>
      
      <div className="schools-container">
        <header className="schools-header">
          <div className="schools-header-top">
            <h1 className="schools-title">
              🎓 Cursos
            </h1>
            <AddCourseButton />
          </div>
          <p className="schools-description">
            Administra los cursos, secciones y niveles académicos de la institución.
          </p>
        </header>

        {courses.length === 0 ? (
          <div className="schools-empty">
            <div className="schools-empty-icon">🎓</div>
            <p className="schools-empty-title">No hay cursos registrados</p>
            <p className="schools-empty-subtitle">Comienza agregando tu primer curso</p>
          </div>
        ) : (
          <div className="schools-grid">
            {courses.map((course) => (
              <div key={course.id} className="schools-card">
                <div className="schools-card-header">
                  <div>
                    <h3 className="schools-card-title">
                      {course.name}
                    </h3>
                  </div>
                  <span className="schools-card-badge">
                    {course.academicLevel}
                  </span>
                </div>
                
                <div className="schools-card-info">
                  <div className="schools-card-info-item">
                    <span className="schools-card-info-icon">🏫</span>
                    <span>{course.school.name}</span>
                  </div>
                  {course.studentCount && (
                    <div className="schools-card-info-item">
                      <span className="schools-card-info-icon">👥</span>
                      <span>{course.studentCount} estudiantes</span>
                    </div>
                  )}
                  <div className="schools-card-info-item">
                    <span className="schools-card-info-icon">📅</span>
                    <span>Año {course.academicYear}</span>
                  </div>
                  {course.schedules.length > 0 && (
                    <div className="schools-card-info-item">
                      <span className="schools-card-info-icon">🗓️</span>
                      <span>{course.schedules.length} horario{course.schedules.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
                
                <div className="schools-card-footer">
                  <button className="schools-card-btn schools-card-btn-primary">
                    {course.schedules.length > 0 ? 'Ver Horario' : 'Crear Horario'}
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

interface CourseCardProps {
  name: string;
  level: string;
  students: number;
  hasSchedule: boolean;
}

function CourseCard({ name, level, students, hasSchedule }: CourseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-neutral-900">{name}</h3>
          <Badge variant={hasSchedule ? 'success' : 'warning'}>
            {hasSchedule ? 'Con horario' : 'Sin horario'}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm text-neutral-600 mb-4">
          <p className="flex items-center gap-2">
            <span>📚</span>
            <span>Nivel: {level}</span>
          </p>
          <p className="flex items-center gap-2">
            <span>👥</span>
            <span>{students} estudiantes</span>
          </p>
          <p className="flex items-center gap-2">
            <span>📅</span>
            <span>Año académico: 2025</span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            Editar
          </Button>
          <Button variant="primary" size="sm" className="flex-1">
            {hasSchedule ? 'Ver Horario' : 'Crear Horario'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
