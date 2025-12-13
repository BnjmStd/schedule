/**
 * 🔐 Helper para obtener datos del usuario actual con sus permisos
 */

import { getSession } from "./session";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado");
  }
  return session;
}

/**
 * Obtiene los IDs de los colegios a los que el usuario tiene acceso
 */
export async function getUserSchoolIds(): Promise<string[]> {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado");
  }

  const userSchools = await prisma.userSchool.findMany({
    where: { userId: session.id },
    select: { schoolId: true },
  });

  return userSchools.map((us) => us.schoolId);
}

/**
 * Verifica si un usuario tiene acceso a un colegio específico
 */
export async function userHasAccessToSchool(
  schoolId: string
): Promise<boolean> {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado");
  }

  const userSchool = await prisma.userSchool.findUnique({
    where: {
      userId_schoolId: {
        userId: session.id,
        schoolId,
      },
    },
  });

  return !!userSchool;
}

/**
 * Obtiene el rol del usuario en un colegio específico
 */
export async function getUserSchoolRole(
  schoolId: string
): Promise<string | null> {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado");
  }

  const userSchool = await prisma.userSchool.findUnique({
    where: {
      userId_schoolId: {
        userId: session.id,
        schoolId,
      },
    },
    select: { role: true },
  });

  return userSchool?.role || null;
}
