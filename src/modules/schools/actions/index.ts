/**
 * 🏫 Server Actions - Schools
 * 
 * Server Actions de Next.js 16 para gestionar escuelas
 * Estas funciones se ejecutan en el servidor
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getUserSchoolIds, userHasAccessToSchool } from '@/lib/auth-helpers';
import { CreateSchoolInput, UpdateSchoolInput, School } from '@/types';

export async function getSchools(): Promise<School[]> {
  const schoolIds = await getUserSchoolIds();
  
  const schools = await prisma.school.findMany({
    where: {
      id: { in: schoolIds },
    },
    orderBy: { name: 'asc' },
  });
  
  return schools.map(school => ({
    ...school,
    phone: school.phone || undefined,
    email: school.email || undefined,
    createdAt: school.createdAt,
    updatedAt: school.updatedAt,
  }));
}

export async function getSchoolById(id: string): Promise<School | null> {
  const hasAccess = await userHasAccessToSchool(id);
  
  if (!hasAccess) {
    throw new Error('No tienes acceso a este colegio');
  }
  
  const school = await prisma.school.findUnique({
    where: { id },
  });
  
  if (!school) return null;
  
  return {
    ...school,
    phone: school.phone || undefined,
    email: school.email || undefined,
    createdAt: school.createdAt,
    updatedAt: school.updatedAt,
  };
}

export async function createSchool(data: CreateSchoolInput): Promise<School> {
  const user = await getCurrentUser();
  
  const school = await prisma.school.create({
    data: {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      // Crear la relación UserSchool automáticamente
      users: {
        create: {
          userId: user.id,
          role: 'admin',
        },
      },
    },
  });
  
  revalidatePath('/schools');
  
  return {
    ...school,
    phone: school.phone || undefined,
    email: school.email || undefined,
    createdAt: school.createdAt,
    updatedAt: school.updatedAt,
  };
}

export async function updateSchool(data: UpdateSchoolInput): Promise<School | null> {
  const { id, ...updateData } = data;
  
  const hasAccess = await userHasAccessToSchool(id);
  if (!hasAccess) {
    throw new Error('No tienes acceso a este colegio');
  }
  
  try {
    const school = await prisma.school.update({
      where: { id },
      data: updateData,
    });
    
    revalidatePath('/schools');
    revalidatePath(`/schools/${id}`);
    
    return {
      ...school,
      phone: school.phone || undefined,
      email: school.email || undefined,
      createdAt: school.createdAt,
      updatedAt: school.updatedAt,
    };
  } catch (error) {
    return null;
  }
}

export async function deleteSchool(id: string): Promise<boolean> {
  const hasAccess = await userHasAccessToSchool(id);
  if (!hasAccess) {
    throw new Error('No tienes acceso a este colegio');
  }
  
  try {
    await prisma.school.delete({
      where: { id },
    });
    
    revalidatePath('/schools');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Obtener configuración de horario del colegio
 */
export async function getSchoolScheduleConfig(schoolId: string) {
  const hasAccess = await userHasAccessToSchool(schoolId);
  if (!hasAccess) {
    throw new Error('No tienes acceso a este colegio');
  }

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: {
      scheduleStartTime: true,
      scheduleEndTime: true,
      blockDuration: true,
      breakDuration: true,
      lunchBreakEnabled: true,
      lunchBreakStart: true,
      lunchBreakEnd: true,
    },
  });

  if (!school) {
    throw new Error('Colegio no encontrado');
  }

  return {
    startTime: school.scheduleStartTime,
    endTime: school.scheduleEndTime,
    blockDuration: school.blockDuration,
    breakDuration: school.breakDuration,
    lunchBreak: {
      enabled: school.lunchBreakEnabled,
      startTime: school.lunchBreakStart,
      endTime: school.lunchBreakEnd,
    },
  };
}

/**
 * Actualizar configuración de horario del colegio
 */
export async function updateSchoolScheduleConfig(
  schoolId: string,
  config: {
    startTime: string;
    endTime: string;
    blockDuration: number;
    breakDuration: number;
    lunchBreak: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  }
) {
  const hasAccess = await userHasAccessToSchool(schoolId);
  if (!hasAccess) {
    throw new Error('No tienes acceso a este colegio');
  }

  await prisma.school.update({
    where: { id: schoolId },
    data: {
      scheduleStartTime: config.startTime,
      scheduleEndTime: config.endTime,
      blockDuration: config.blockDuration,
      breakDuration: config.breakDuration,
      lunchBreakEnabled: config.lunchBreak.enabled,
      lunchBreakStart: config.lunchBreak.startTime,
      lunchBreakEnd: config.lunchBreak.endTime,
    },
  });

  revalidatePath('/schools');
  revalidatePath('/schedules');
  return { success: true };
}
