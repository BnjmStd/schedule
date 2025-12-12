/**
 * 🏫 Server Actions - Schools
 * 
 * Server Actions de Next.js 16 para gestionar escuelas
 * Estas funciones se ejecutan en el servidor
 */

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { CreateSchoolInput, UpdateSchoolInput, School } from '@/types';

export async function getSchools(): Promise<School[]> {
  const schools = await prisma.school.findMany({
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
  const school = await prisma.school.create({
    data: {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
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
