import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";

/** Roles that land on the admin panel after login */
const ADMIN_ROLES = new Set(["OWNER", "ADMIN", "SUPER_ADMIN"]);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    // Buscar usuario con su colegio
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolId: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    // Crear sesión con schoolId incluido
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name ?? "",
      role: user.role,
      schoolId: user.schoolId,
    });

    // Determinar ruta de redirección según rol
    const redirectTo = user.role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
    // OWNER/ADMIN/STAFF/VIEWER → /dashboard (necesitan schoolId)
    // SUPER_ADMIN             → /admin     (panel global, sin schoolId)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        schoolId: user.schoolId,
      },
      redirectTo,
    });
  } catch (error) {
    console.error("[login] Error:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
