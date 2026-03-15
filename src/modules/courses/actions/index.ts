/**
 * 🎓 Server Actions - Courses
 */

"use server";

import { prisma } from "@/lib/prisma";
import { getSessionSchoolId, userHasAccessToSchool } from "@/lib/auth-helpers";
import { validateCourseCreation } from "@/lib/billing";
import type { AcademicLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getCourses() {
  const schoolId = await getSessionSchoolId();

  const courses = await prisma.course.findMany({
    where: { schoolId },
    include: {
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      schedules: {
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [{ academicLevel: "asc" }, { grade: "asc" }, { section: "asc" }],
  });

  return courses;
}

export async function getCourse(id: string) {
  const schoolId = await getSessionSchoolId();

  const course = await prisma.course.findFirst({
    where: {
      id,
      schoolId,
    },
    include: {
      school: true,
      schedules: true,
    },
  });

  return course;
}

export async function createCourse(data: {
  schoolId: string;
  name: string;
  grade: string;
  section: string;
  academicLevel: string;
  academicYear: number;
  studentCount?: number;
}) {
  const hasAccess = await userHasAccessToSchool(data.schoolId);
  if (!hasAccess) {
    throw new Error("No tienes acceso a esta escuela");
  }

  // Verificar límite del plan de suscripción
  await validateCourseCreation(data.schoolId);

  const course = await prisma.course.create({
    data: { ...data, academicLevel: data.academicLevel as AcademicLevel },
  });

  revalidatePath("/courses");
  return course;
}

export async function updateCourse(
  id: string,
  data: {
    name?: string;
    grade?: string;
    section?: string;
    academicLevel?: string;
    academicYear?: number;
    studentCount?: number;
  },
) {
  const schoolId = await getSessionSchoolId();

  const { academicLevel, ...rest } = data;
  const course = await prisma.course.update({
    where: { id, schoolId },
    data: {
      ...rest,
      ...(academicLevel !== undefined && {
        academicLevel: academicLevel as AcademicLevel,
      }),
    },
  });

  revalidatePath("/courses");
  return course;
}

export async function deleteCourse(id: string) {
  const schoolId = await getSessionSchoolId();

  await prisma.course.delete({
    where: { id, schoolId },
  });

  revalidatePath("/courses");
}

export async function countCourses() {
  const schoolId = await getSessionSchoolId();

  const count = await prisma.course.count({
    where: { schoolId },
  });

  return count;
}
