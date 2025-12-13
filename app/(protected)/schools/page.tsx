import { getSchools } from '@/modules/schools/actions';
import { SchoolList, AddSchoolButton } from '@/modules/schools/components';
import '../../schools.css';

export default async function SchoolsPage() {
  const schools = await getSchools();

  return (
    <div className="schools-page">
      <div className="schools-bg">
        <div className="schools-gradient" />
      </div>
      
      <div className="schools-container">
        <header className="schools-header">
          <div className="schools-header-top">
            <h1 className="schools-title">
              🏫 Colegios
            </h1>
            <AddSchoolButton />
          </div>
          <p className="schools-description">
            Gestiona los colegios registrados en el sistema. Cada colegio puede tener múltiples profesores, cursos y horarios.
          </p>
        </header>

        <SchoolList schools={schools} />
      </div>
    </div>
  );
}
