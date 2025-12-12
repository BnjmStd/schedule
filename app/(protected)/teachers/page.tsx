import { Container, PageHeader } from "@/components/layout";
import { Button, Card, CardContent, Badge } from "@/components/ui";

export default function TeachersPage() {
  return (
    <Container>
      <PageHeader
        title="👨‍🏫 Profesores"
        description="Administra los profesores, su disponibilidad horaria y las asignaturas que pueden dictar."
        actions={<Button variant="primary">+ Agregar Profesor</Button>}
      />

      <div className="space-y-4">
        <DemoTeacherCard
          name="María González"
          email="maria.gonzalez@ejemplo.cl"
          subjects={["Matemáticas", "Física"]}
          availability="Lunes a Viernes, 8:00 - 17:00"
        />
        <DemoTeacherCard
          name="Pedro Ramírez"
          email="pedro.ramirez@ejemplo.cl"
          subjects={["Historia", "Geografía"]}
          availability="Lunes a Jueves, 9:00 - 16:00"
        />
        <DemoTeacherCard
          name="Ana Torres"
          email="ana.torres@ejemplo.cl"
          subjects={["Lenguaje", "Literatura"]}
          availability="Martes a Viernes, 8:30 - 15:30"
        />
      </div>
    </Container>
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
