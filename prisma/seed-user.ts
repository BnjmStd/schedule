/**
 * 👤 Script para crear un usuario demo
 * Ejecutar con: npm run seed:user
 */

import { prisma } from "../src/lib/prisma";
import { hash } from "bcryptjs";

async function main() {
  console.log("👤 Creando usuario demo...");

  const password = await hash("demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@bbschedule.com" },
    update: {},
    create: {
      name: "Usuario Demo",
      email: "demo@bbschedule.com",
      password: password,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuario demo creado:");
  console.log("   Email: demo@bbschedule.com");
  console.log("   Password: demo1234");
  console.log("   Role:", user.role);

  console.log(
    "✅ Usuario creado (sin escuela asociada - asignar schoolId manualmente si es necesario)",
  );
  console.log("\n🎉 Seed de usuario completado!");
}

main()
  .catch((e) => {
    console.error("❌ Error al ejecutar seed de usuario:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
