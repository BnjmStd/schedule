import { Container, PageHeader } from "@/components/layout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

export default function SubjectsPage() {
  return (
    <Container>
      <PageHeader
        title="📚 Asignaturas"
        description="Gestiona las asignaturas disponibles y asígnalas a profesores calificados."
        actions={<Button variant="primary">+ Agregar Asignatura</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SubjectCard
          name="Matemáticas"
          code="MAT101"
          teachers={["María González", "Carlos López"]}
          color="primary"
        />
        <SubjectCard
          name="Física"
          code="FIS201"
          teachers={["María González"]}
          color="secondary"
        />
        <SubjectCard
          name="Historia"
          code="HIS301"
          teachers={["Pedro Ramírez"]}
          color="accent"
        />
        <SubjectCard
          name="Lenguaje"
          code="LEN101"
          teachers={["Ana Torres"]}
          color="success"
        />
        <SubjectCard
          name="Química"
          code="QUI201"
          teachers={["Laura Fernández"]}
          color="warning"
        />
        <SubjectCard
          name="Inglés"
          code="ING101"
          teachers={["John Smith"]}
          color="neutral"
        />
      </div>
    </Container>
  );
}

interface SubjectCardProps {
  name: string;
  code: string;
  teachers: string[];
  color: "primary" | "secondary" | "accent" | "success" | "warning" | "neutral";
}

function SubjectCard({ name, code, teachers, color }: SubjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent>
        <Badge variant={color} className="mb-3">
          {code}
        </Badge>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">{name}</h3>
        <div className="text-sm text-neutral-600">
          <span className="font-medium">Profesores:</span>
          <ul className="mt-1 space-y-1">
            {teachers.map((teacher) => (
              <li key={teacher} className="flex items-center gap-2">
                <span>👨‍🏫</span>
                <span>{teacher}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1">
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
