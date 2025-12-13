'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

interface ScheduleBlock {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: string;
  course?: string;
  color: string;
}

/**
 * Obtener horarios de un curso
 */
export async function getSchedulesForCourse(courseId: string) {
  try {
    const session = await getSession();
    if (!session?.id) {
      throw new Error('No autorizado');
    }

    const schedules = await prisma.schedule.findMany({
      where: {
        courseId,
        isActive: true,
      },
      include: {
        blocks: {
          include: {
            subject: true,
            teacher: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return schedules;
  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    throw error;
  }
}

/**
 * Guardar/actualizar horario con bloques
 */
export async function saveSchedule(data: {
  courseId: string;
  entityType: 'course' | 'teacher';
  blocks: ScheduleBlock[];
}) {
  try {
    const session = await getSession();
    if (!session?.id) {
      throw new Error('No autorizado');
    }

    const { courseId, blocks } = data;

    // Obtener el curso para verificar acceso y obtener schoolId
    const course = await prisma.course.findFirst({
      where: { id: courseId },
      include: {
        school: {
          include: {
            users: {
              where: { userId: session.id },
            },
          },
        },
      },
    });

    if (!course || course.school.users.length === 0) {
      throw new Error('No tienes acceso a este curso');
    }

    const schoolId = course.schoolId;
    const academicYear = new Date().getFullYear();

    // Buscar horario activo existente o crear uno nuevo
    let schedule = await prisma.schedule.findFirst({
      where: {
        courseId,
        academicYear,
        isActive: true,
      },
    });

    if (!schedule) {
      // Crear nuevo horario
      const startDate = new Date(academicYear, 0, 1); // 1 de enero
      const endDate = new Date(academicYear, 11, 31); // 31 de diciembre

      schedule = await prisma.schedule.create({
        data: {
          schoolId,
          courseId,
          name: `Horario ${course.name} - ${academicYear}`,
          academicYear,
          semester: new Date().getMonth() < 6 ? 1 : 2,
          startDate,
          endDate,
          isActive: true,
        },
      });
    }

    // Eliminar bloques existentes del horario
    await prisma.scheduleBlock.deleteMany({
      where: { scheduleId: schedule.id },
    });

    // Crear los nuevos bloques si hay alguno
    if (blocks.length > 0) {
      // Para cada bloque, necesitamos obtener o crear subject y teacher
      for (const block of blocks) {
        // Buscar o crear la asignatura
        let subject = await prisma.subject.findFirst({
          where: {
            schoolId,
            name: block.subject,
          },
        });

        if (!subject) {
          // Crear asignatura si no existe
          const code = block.subject
            .substring(0, 3)
            .toUpperCase()
            .replace(/\s/g, '')
            .padEnd(3, 'X');

          subject = await prisma.subject.create({
            data: {
              schoolId,
              name: block.subject,
              code: `${code}${Date.now().toString().slice(-3)}`,
              color: block.color,
            },
          });
        }

        // Buscar o crear el profesor (si es curso)
        let teacherId = '';
        if (block.teacher) {
          const [firstName, ...lastNameParts] = block.teacher.split(' ');
          const lastName = lastNameParts.join(' ') || firstName;

          let teacher = await prisma.teacher.findFirst({
            where: {
              schoolId,
              firstName: { contains: firstName },
              lastName: { contains: lastName },
            },
          });

          if (!teacher) {
            // Crear profesor si no existe
            teacher = await prisma.teacher.create({
              data: {
                schoolId,
                firstName,
                lastName,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@school.edu`,
              },
            });
          }

          teacherId = teacher.id;
        }

        // Calcular duración en minutos
        const [startHour, startMin] = block.startTime.split(':').map(Number);
        const [endHour, endMin] = block.endTime.split(':').map(Number);
        const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

        // Obtener número de bloque basado en la hora de inicio
        const blockNumber = Math.floor((startHour - 9) * 2 + startMin / 30) + 1;

        // Crear el bloque de horario
        await prisma.scheduleBlock.create({
          data: {
            scheduleId: schedule.id,
            courseId,
            subjectId: subject.id,
            teacherId,
            dayOfWeek: block.day,
            blockNumber,
            startTime: block.startTime,
            endTime: block.endTime,
            duration,
          },
        });
      }
    }

    revalidatePath('/schedules');
    return { success: true, scheduleId: schedule.id };
  } catch (error) {
    console.error('Error guardando horario:', error);
    throw error;
  }
}

/**
 * Eliminar un horario completo
 */
export async function deleteSchedule(scheduleId: string) {
  try {
    const session = await getSession();
    if (!session?.id) {
      throw new Error('No autorizado');
    }

    // Verificar acceso
    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        school: {
          users: {
            some: { userId: session.id },
          },
        },
      },
    });

    if (!schedule) {
      throw new Error('No tienes acceso a este horario');
    }

    // Los bloques se eliminan en cascada
    await prisma.schedule.delete({
      where: { id: scheduleId },
    });

    revalidatePath('/schedules');
    return { success: true };
  } catch (error) {
    console.error('Error eliminando horario:', error);
    throw error;
  }
}
