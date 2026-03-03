/**
 * 🔒 Script seguro para crear un SUPER_ADMIN
 *
 * Requiere que la variable de entorno INTERNAL_SUPERADMIN_KEY esté
 * definida y coincida con el valor pasado via --key.
 *
 * Argumentos:
 *   --key     <valor>      Clave interna (debe coincidir con INTERNAL_SUPERADMIN_KEY)
 *   --email   <email>      Email del superadmin
 *   --name    <nombre>     Nombre del superadmin
 *   --password <pass>      Contraseña (mín. 8 caracteres)
 *   --force               Permite crear aunque ya exista otro SUPER_ADMIN
 *
 * Uso:
 *   npx ts-node script/create-superadmin.ts \
 *     --key "$INTERNAL_SUPERADMIN_KEY" \
 *     --email "super@classytime.com" \
 *     --name "Super Admin" \
 *     --password "strongpassword"
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ── Arg parser ────────────────────────────────────────────────────────────────
function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  // ── 1. Verificar clave de seguridad ──────────────────────────────────────
  const envKey = process.env.INTERNAL_SUPERADMIN_KEY;
  if (!envKey) {
    console.error(
      "❌ La variable de entorno INTERNAL_SUPERADMIN_KEY no está definida.",
    );
    console.error(
      "   Defínela en .env o como variable de entorno antes de ejecutar este script.",
    );
    process.exit(1);
  }

  const providedKey = arg("key");
  if (!providedKey) {
    console.error("❌ Debes proporcionar --key <valor>");
    process.exit(1);
  }

  if (providedKey !== envKey) {
    console.error(
      "❌ La clave proporcionada no coincide con INTERNAL_SUPERADMIN_KEY.",
    );
    process.exit(1);
  }

  // ── 2. Verificar argumentos requeridos ───────────────────────────────────
  const email = arg("email");
  const name = arg("name");
  const password = arg("password");
  const force = hasFlag("force");

  if (!email || !name || !password) {
    console.error("❌ Uso: --email <email> --name <nombre> --password <pass>");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  // ── 3. Verificar si ya existe un SUPER_ADMIN ──────────────────────────────
  const existingSuperAdmins = await prisma.user.findMany({
    where: { role: "SUPER_ADMIN" },
    select: { id: true, email: true },
  });

  if (existingSuperAdmins.length > 0 && !force) {
    console.error(
      `❌ Ya existen ${existingSuperAdmins.length} SUPER_ADMIN(s) en el sistema:`,
    );
    existingSuperAdmins.forEach((u) =>
      console.error(`   - ${u.email} (${u.id})`),
    );
    console.error(
      "\n   Usa --force si realmente necesitas crear otro SUPER_ADMIN.",
    );
    process.exit(1);
  }

  if (existingSuperAdmins.length > 0 && force) {
    console.warn(
      `⚠️  --force activado. Ya existen ${existingSuperAdmins.length} SUPER_ADMIN(s). Continuando...`,
    );
  }

  // ── 4. Verificar unicidad de email ───────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`❌ Ya existe un usuario con el email: ${email}`);
    process.exit(1);
  }

  // ── 5. Crear el SUPER_ADMIN ──────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      schoolId: null, // Los SUPER_ADMIN no pertenecen a ningún colegio
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      schoolId: true,
      createdAt: true,
    },
  });

  // ── 6. Registrar en AuditLog ─────────────────────────────────────────────
  await prisma.auditLog.create({
    data: {
      schoolId: null,
      actorId: superAdmin.id, // Se auto-registra (acción inicial del script)
      actorRole: "SUPER_ADMIN",
      action: "USER_CREATED",
      entity: "User",
      entityId: superAdmin.id,
      metadata: JSON.stringify({
        source: "create-superadmin-script",
        createdAt: new Date().toISOString(),
      }),
    },
  });

  console.log("\n✅ SUPER_ADMIN creado exitosamente:");
  console.log(`   ID:        ${superAdmin.id}`);
  console.log(`   Email:     ${superAdmin.email}`);
  console.log(`   Nombre:    ${superAdmin.name}`);
  console.log(`   Rol:       ${superAdmin.role}`);
  console.log(`   schoolId:  ${superAdmin.schoolId ?? "null (global)"}`);
  console.log(`   Creado:    ${superAdmin.createdAt.toISOString()}`);
  console.log(
    "\n⚠️  Guarda la contraseña en un lugar seguro. No se puede recuperar.\n",
  );
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
