import { getSubjects } from "@/modules/subjects/actions";
import { AddSubjectButton } from "@/modules/subjects/components/AddSubjectButton";
import "../../subjects.css";

export default async function SubjectsPage() {
  const subjects = await getSubjects();

  return (
    <div className="schools-page">
      <div className="schools-bg">
        <div className="schools-gradient" />
      </div>

      <div className="schools-container">
        <header className="schools-header">
          <div className="schools-header-top">
            <h1 className="schools-title">📚 Asignaturas</h1>
            <AddSubjectButton />
          </div>
          <p className="schools-description">
            Gestiona las asignaturas disponibles y asígnalas a profesores
            calificados.
          </p>
        </header>

        {subjects.length === 0 ? (
          <div className="schools-empty">
            <div className="schools-empty-icon">📚</div>
            <p className="schools-empty-title">
              No hay asignaturas registradas
            </p>
            <p className="schools-empty-subtitle">
              Comienza agregando tu primera asignatura
            </p>
          </div>
        ) : (
          <div className="schools-grid">
            {subjects.map((subject) => (
              <div key={subject.id} className="schools-card">
                <div className="schools-card-header">
                  <div>
                    <h3 className="schools-card-title">{subject.name}</h3>
                  </div>
                  <span
                    className="schools-card-badge"
                    style={{
                      background: subject.color
                        ? `${subject.color}33`
                        : undefined,
                      borderColor: subject.color
                        ? `${subject.color}66`
                        : undefined,
                    }}
                  >
                    {subject.code}
                  </span>
                </div>

                <div className="schools-card-info">
                  <div className="schools-card-info-item">
                    <span className="schools-card-info-icon">🏫</span>
                    <span>{subject.school.name}</span>
                  </div>
                  {subject.teacherSubjects.length > 0 && (
                    <div className="schools-card-info-item">
                      <span className="schools-card-info-icon">👨‍🏫</span>
                      <span>
                        {subject.teacherSubjects.length} profesor
                        {subject.teacherSubjects.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                  )}
                  {subject.description && (
                    <div className="schools-card-info-item">
                      <span className="schools-card-info-icon">📝</span>
                      <span>{subject.description}</span>
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
