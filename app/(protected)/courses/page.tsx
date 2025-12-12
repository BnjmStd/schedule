import { Container, PageHeader } from '@/components/layout';
import { Button, Badge, Card, CardContent } from '@/components/ui';

export default function CoursesPage() {
  return (
    <Container>
      <PageHeader
        title="🎓 Cursos"
        description="Administra los cursos, secciones y niveles académicos de la institución."
        actions={
          <Button variant="primary">
            + Agregar Curso
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseCard
          name="1° Básico A"
          level="Básica"
          students={32}
          hasSchedule={true}
        />
        <CourseCard
          name="1° Básico B"
          level="Básica"
          students={30}
          hasSchedule={true}
        />
        <CourseCard
          name="2° Básico A"
          level="Básica"
          students={28}
          hasSchedule={false}
        />
        <CourseCard
          name="3° Medio A"
          level="Media"
          students={35}
          hasSchedule={true}
        />
        <CourseCard
          name="3° Medio B"
          level="Media"
          students={34}
          hasSchedule={false}
        />
        <CourseCard
          name="4° Medio A"
          level="Media"
          students={38}
          hasSchedule={true}
        />
      </div>
    </Container>
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
