/**
 * 🏫 Mock Database - Schools
 *
 * Simulación de base de datos en memoria
 * En producción, reemplazar con Prisma, Drizzle, o tu ORM preferido
 */

import { School } from "@/types";

// Simulación de datos en memoria
let schools: School[] = [
  {
    id: "1",
    name: "Colegio San José",
    address: "Av. Principal 123, Santiago",
    phone: "+56 2 2345 6789",
    email: "contacto@sanjose.cl",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Instituto Nacional",
    address: "Calle Central 456, Valparaíso",
    phone: "+56 32 234 5678",
    email: "info@institutonacional.cl",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "3",
    name: "Liceo Técnico Industrial",
    address: "Av. Industrial 789, Concepción",
    phone: "+56 41 245 6789",
    email: "contacto@liceotecnico.cl",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
];

export const schoolsDb = {
  getAll: async (): Promise<School[]> => {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 100));
    return schools;
  },

  getById: async (id: string): Promise<School | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return schools.find((school) => school.id === id) || null;
  },

  create: async (
    data: Omit<School, "id" | "createdAt" | "updatedAt">
  ): Promise<School> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const newSchool: School = {
      ...data,
      id: String(Date.now()),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    schools.push(newSchool);
    return newSchool;
  },

  update: async (id: string, data: Partial<School>): Promise<School | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = schools.findIndex((school) => school.id === id);
    if (index === -1) return null;

    schools[index] = {
      ...schools[index],
      ...data,
      updatedAt: new Date(),
    };
    return schools[index];
  },

  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const index = schools.findIndex((school) => school.id === id);
    if (index === -1) return false;

    schools.splice(index, 1);
    return true;
  },
};
