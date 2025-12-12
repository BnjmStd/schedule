import { Container, PageHeader } from '@/components/layout';
import { Button, Badge } from '@/components/ui';
import { ScheduleGrid } from '@/modules/schedules/components';
import { Schedule, DayOfWeek, DEFAULT_TIME_BLOCKS } from '@/types';

export default function SchedulesPage() {
  // Datos de ejemplo para demostrar el componente ScheduleGrid
  const demoSchedule: Schedule = {
    id: '1',
    schoolId: '1',
    courseId: '1',
    name: 'Horario 1° Básico A - Semestre 1',
    academicYear: 2025,
    semester: 1,
    startDate: new Date('2025-03-01'),
    endDate: new Date('2025-07-31'),
    isActive: true,
    blocks: [
      // Lunes
      {
        id: '1',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Matemáticas',
        teacherId: 'María González',
        dayOfWeek: DayOfWeek.MONDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[0],
        classroom: 'Sala 101',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Lenguaje',
        teacherId: 'Ana Torres',
        dayOfWeek: DayOfWeek.MONDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[1],
        classroom: 'Sala 101',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Historia',
        teacherId: 'Pedro Ramírez',
        dayOfWeek: DayOfWeek.MONDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[3],
        classroom: 'Sala 101',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Martes
      {
        id: '4',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Física',
        teacherId: 'María González',
        dayOfWeek: DayOfWeek.TUESDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[0],
        classroom: 'Lab. Ciencias',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Inglés',
        teacherId: 'John Smith',
        dayOfWeek: DayOfWeek.TUESDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[2],
        classroom: 'Sala 101',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Miércoles
      {
        id: '6',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Matemáticas',
        teacherId: 'María González',
        dayOfWeek: DayOfWeek.WEDNESDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[1],
        classroom: 'Sala 101',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '7',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Química',
        teacherId: 'Laura Fernández',
        dayOfWeek: DayOfWeek.WEDNESDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[4],
        classroom: 'Lab. Química',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Jueves
      {
        id: '8',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Lenguaje',
        teacherId: 'Ana Torres',
        dayOfWeek: DayOfWeek.THURSDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[0],
        classroom: 'Sala 101',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '9',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Historia',
        teacherId: 'Pedro Ramírez',
        dayOfWeek: DayOfWeek.THURSDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[3],
        classroom: 'Sala 101',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Viernes
      {
        id: '10',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Educación Física',
        teacherId: 'Carlos Muñoz',
        dayOfWeek: DayOfWeek.FRIDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[2],
        classroom: 'Gimnasio',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '11',
        scheduleId: '1',
        courseId: '1',
        subjectId: 'Artes',
        teacherId: 'Sofía Díaz',
        dayOfWeek: DayOfWeek.FRIDAY,
        timeBlock: DEFAULT_TIME_BLOCKS[5],
        classroom: 'Sala de Arte',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <Container size="xl">
      <PageHeader
        title="🗓️ Horarios"
        description="Visualiza y gestiona los horarios semanales con detección automática de conflictos."
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              Exportar PDF
            </Button>
            <Button variant="primary">
              + Nuevo Horario
            </Button>
          </div>
        }
      />

      {/* Información del horario */}
      <div className="mb-6 flex items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            {demoSchedule.name}
          </h2>
          <p className="text-sm text-neutral-600">
            Año académico {demoSchedule.academicYear} - Semestre {demoSchedule.semester}
          </p>
        </div>
        <Badge variant="success">Activo</Badge>
      </div>

      {/* Grilla de horarios */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <ScheduleGrid
          schedule={demoSchedule}
          timeBlocks={DEFAULT_TIME_BLOCKS.slice(0, 6)}
          onBlockClick={(block, day, timeBlock) => {
            console.log('Block clicked:', { block, day, timeBlock });
          }}
        />
      </div>

      {/* Leyenda */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900 mb-4">
          📋 Leyenda
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary-100 border-2 border-primary-300"></div>
            <span>Matemáticas / Ciencias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary-100 border-2 border-secondary-300"></div>
            <span>Lenguaje / Humanidades</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent-100 border-2 border-accent-300"></div>
            <span>Idiomas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success-100 border-2 border-success-300"></div>
            <span>Ed. Física / Artes</span>
          </div>
        </div>
      </div>
    </Container>
  );
}
