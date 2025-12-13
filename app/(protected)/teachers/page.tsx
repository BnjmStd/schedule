import { getTeachers } from '@/modules/teachers/actions';
import { AddTeacherButton } from '@/modules/teachers/components/AddTeacherButton';
import '../../teachers.css';

export default async function TeachersPage() {
  const teachers = await getTeachers();

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
            <AddTeacherButton />
          </div>
          <p className="schools-description">
            Administra los profesores, su disponibilidad horaria y las asignaturas que pueden dictar.
          </p>
        </header>

        {teachers.length === 0 ? (
          <div className="schools-empty">
            <div className="schools-empty-icon">👨‍🏫</div>
            <p className="schools-empty-title">No hay profesores registrados</p>
            <p className="schools-empty-subtitle">Comienza agregando tu primer profesor</p>
          </div>
        ) : (
          <div className="schools-grid">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="schools-card">
                <div className="schools-card-header">
                  <div>
                    <h3 className="schools-card-title">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
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
