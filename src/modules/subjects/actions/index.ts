/**
 * 📚 Server Actions - Subjects
 */

"use server";

import { prisma } from "@/lib/prisma";
import { getSessionSchoolId, userHasAccessToSchool } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

export async function getSubjects() {
  const schoolId = await getSessionSchoolId();

  const subjects = await prisma.subject.findMany({
    where: { schoolId },
    include: {
      school: { select: { name: true } },
      teacherSubjects: {
        include: {
          teacher: {
            select: { firstName: true, lastName: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return subjects;
}

export async function getSubject(id: string) {
  const schoolId = await getSessionSchoolId();

  const subject = await prisma.subject.findFirst({
    where: { id, schoolId },
    include: {
      school: true,
      teacherSubjects: { include: { teacher: true } },
    },
  });

  return subject;
}

export async function createSubject(data: {
  schoolId: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
}) {
  const hasAccess = await userHasAccessToSchool(data.schoolId);
  if (!hasAccess) {
    throw new Error(`No tienes acceso a esta escuela.`);
  }

  const existingSubject = await prisma.subject.findFirst({
    where: { schoolId: data.schoolId, code: data.code },
  });

  if (existingSubject) {
    throw new Error(
      `Ya existe una asignatura con el código "${data.code}" en esta escuela`,
    );
  }

  const subject = await prisma.subject.create({ data });
  revalidatePath("/subjects");
  return subject;
}

export async function updateSubject(
  id: string,
  data: { name?: string; code?: string; description?: string; color?: string },
) {
  const schoolId = await getSessionSchoolId();

  const currentSubject = await prisma.subject.findFirst({
    where: { id, schoolId },
  });

  if (!currentSubject) {
    throw new Error("Asignatura no encontrada o sin acceso");
  }

  if (data.code && data.code !== currentSubject.code) {
    const existingSubject = await prisma.subject.findFirst({
      where: {
        schoolId: currentSubject.schoolId,
        code: data.code,
        id: { not: id },
      },
    });
    if (existingSubject) {
      throw new Error(
        `Ya existe otra asignatura con el código "${data.code}" en esta escuela`,
      );
    }
  }

  const subject = await prisma.subject.update({
    where: { id, schoolId },
    data,
  });

  revalidatePath("/subjects");
  return subject;
}

export async function deleteSubject(id: string) {
  const schoolId = await getSessionSchoolId();

  await prisma.subject.delete({
    where: { id, schoolId },
  });

  revalidatePath("/subjects");
}
