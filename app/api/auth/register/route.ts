import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { appendAuditLog } from "@/lib/auth-helpers";
import { z } from "zod";

// ─── Validation schema ────────────────────────────────────────────────────────
const registerSchema = z.object({
  // Datos del administrador
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),

  // Datos institucionales del colegio
  schoolName: z.string().min(2, "El nombre del colegio es obligatorio"),
  schoolAddress: z.string().min(5, "La dirección del colegio es obligatoria"),
  schoolPhone: z.string().optional(),
  schoolEmail: z
    .string()
    .email("Email institucional inválido")
    .optional()
    .or(z.literal("")),
  schoolCountry: z.string().min(2, "El país es obligatorio"),
  schoolRut: z.string().optional(), // RUT/identificador oficial del establecimiento (opcional)

  // Plan inicial
  initialPlan: z.enum(["FREE", "PRO", "ENTERPRISE"]).default("FREE"),
});

export type RegisterPayload = z.infer<typeof registerSchema>;

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Defensa: el signup público NUNCA puede crear un SUPER_ADMIN ────────
    if (body?.role === "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const data = registerSchema.parse(body);

    // ── 1. Verificar unicidad del email del administrador ──────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Este email ya está registrado" },
        { status: 400 },
      );
    }

    // ── 2. Verificar unicidad del email institucional del colegio ──────────
    if (data.schoolEmail) {
      const existingSchoolByEmail = await prisma.school.findFirst({
        where: { email: data.schoolEmail },
        select: { id: true },
      });
      if (existingSchoolByEmail) {
        return NextResponse.json(
          {
            error:
              "Ya existe un colegio registrado con ese email institucional",
          },
          { status: 400 },
        );
      }
    }

    // ── 3. Verificar unicidad por RUT/identificador oficial ────────────────
    // El RUT se guarda en School.phone temporalmente hasta que se agregue
    // un campo dedicado; si se usa como regla de unicidad, validar aquí.
    // Por ahora se guarda como metadata extensible sin bloquear.

    // ── 4. Hash de contraseña ──────────────────────────────────────────────
    const hashedPassword = await hash(data.password, 12);

    // ── 5. Transacción atómica: School + SchoolSubscription + User(OWNER) ──
    const result = await prisma.$transaction(async (tx) => {
      // 5a. Crear el colegio
      const school = await tx.school.create({
        data: {
          name: data.schoolName,
          address: data.schoolAddress,
          phone: data.schoolPhone ?? null,
          email: data.schoolEmail || null,
          // Guardamos país en activeAcademicLevels metadata vía campo phone
          // En el futuro: agregar campo country al schema
          activeAcademicLevels: "BASIC,MIDDLE",
        },
      });

      // 5b. Crear la suscripción inicial del colegio
      const freeEndDate = new Date("9999-12-31T00:00:00.000Z");
      const trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 días

      const isPaidPlan = data.initialPlan !== "FREE";

      await tx.schoolSubscription.create({
        data: {
          schoolId: school.id,
          plan: data.initialPlan,
          status: isPaidPlan ? "TRIALING" : "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: isPaidPlan ? trialEndDate : freeEndDate,
          trialEndsAt: isPaidPlan ? trialEndDate : null,
          metadata: JSON.stringify({
            registeredAt: new Date().toISOString(),
            country: data.schoolCountry,
            schoolRut: data.schoolRut ?? null,
          }),
        },
      });

      // 5c. Crear el primer usuario con rol OWNER
      const ownerCount = await tx.user.count({
        where: { schoolId: school.id, role: "OWNER" },
      });
      if (ownerCount > 0) {
        throw new Error("Este colegio ya tiene un propietario registrado");
      }

      const user = await tx.user.create({
        data: {
          schoolId: school.id,
          name: data.name,
          email: data.email,
          password: hashedPassword,
          role: "OWNER",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          schoolId: true,
          createdAt: true,
        },
      });

      return { school, user };
    });

    // ── 6. Registrar en AuditLog ────────────────────────────────────────────
    await appendAuditLog({
      schoolId: result.school.id,
      actorId: result.user.id,
      actorRole: "OWNER",
      action: "USER_CREATED",
      entity: "User",
      entityId: result.user.id,
      metadata: {
        source: "register",
        schoolName: result.school.name,
      },
    });

    return NextResponse.json(
      {
        message: "Colegio y cuenta creados exitosamente",
        user: result.user,
        school: {
          id: result.school.id,
          name: result.school.name,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Error de validación" },
        { status: 400 },
      );
    }

    console.error("[register] Error:", err);
    return NextResponse.json(
      { error: "Error al crear la cuenta. Por favor intenta de nuevo." },
      { status: 500 },
    );
  }
}
