import { Container, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui';
import { getSchools } from '@/modules/schools/actions';
import { SchoolList } from '@/modules/schools/components';

export default async function SchoolsPage() {
  const schools = await getSchools();

  return (
    <Container>
      <PageHeader
        title="🏫 Colegios"
        description="Gestiona los colegios registrados en el sistema. Cada colegio puede tener múltiples profesores, cursos y horarios."
        actions={
          <Button variant="primary">
            + Agregar Colegio
          </Button>
        }
      />

      <SchoolList schools={schools} />
    </Container>
  );
}
