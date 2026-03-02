/**
 * 🔧 Script para corregir academicLevel en todos los datos
 * Convierte PRIMARY/PRIMARIA -> BASIC
 * Convierte SECONDARY/SECUNDARIA/MEDIA/HIGH_SCHOOL -> MIDDLE
 */

import { prisma } from "../src/lib/prisma";

// Mapeo de conversión
const LEVEL_MAP: Record<string, string> = {
  PRIMARY: "BASIC",
  PRIMARIA: "BASIC",
  SECONDARY: "MIDDLE",
  SECUNDARIA: "MIDDLE",
  MEDIA: "MIDDLE",
  HIGH_SCHOOL: "MIDDLE",
  // Mantener los correctos
  BASIC: "BASIC",
  MIDDLE: "MIDDLE",
};

async function fixAcademicLevels() {
  console.log("🔧 Iniciando corrección de niveles académicos...\n");

  try {
    // 1. Corregir cursos
    const courses = await prisma.course.findMany();
    let coursesFixed = 0;

    for (const course of courses) {
      const correctLevel = LEVEL_MAP[course.academicLevel] || "BASIC";

      if (correctLevel !== course.academicLevel) {
        await prisma.course.update({
          where: { id: course.id },
          data: { academicLevel: correctLevel },
        });
        console.log(
          `✓ ${course.name}: ${course.academicLevel} -> ${correctLevel}`,
        );
        coursesFixed++;
      }
    }

    console.log(`\n📊 Cursos corregidos: ${coursesFixed}/${courses.length}\n`);

    // 2. Corregir schedules con configSnapshot
    const schedules = await prisma.schedule.findMany({
      where: {
        configSnapshot: { not: null },
      },
    });

    let snapshotsFixed = 0;

    for (const schedule of schedules) {
      try {
        const snapshot = JSON.parse(schedule.configSnapshot!);

        if (snapshot.academicLevel) {
          const correctLevel =
            LEVEL_MAP[snapshot.academicLevel] || snapshot.academicLevel;

          if (correctLevel !== snapshot.academicLevel) {
            snapshot.academicLevel = correctLevel;

            await prisma.schedule.update({
              where: { id: schedule.id },
              data: { configSnapshot: JSON.stringify(snapshot) },
            });

            console.log(`✓ Schedule "${schedule.name}": snapshot corregido`);
            snapshotsFixed++;
          }
        }
      } catch (e) {
        console.log(
          `⚠️  Schedule "${schedule.name}": no se pudo parsear snapshot`,
        );
      }
    }

    console.log(
      `\n📅 Snapshots corregidos: ${snapshotsFixed}/${schedules.length}\n`,
    );

    // 3. Verificar configuraciones (no deberían tener problemas, pero por si acaso)
    const configs = await prisma.scheduleLevelConfig.findMany();
    let configsFixed = 0;

    for (const config of configs) {
      const correctLevel =
        LEVEL_MAP[config.academicLevel] || config.academicLevel;

      if (correctLevel !== config.academicLevel) {
        // No podemos actualizar directamente porque academicLevel es parte de la clave única
        console.log(
          `⚠️  Config ${config.id}: tiene "${config.academicLevel}" (requiere migración manual)`,
        );
        configsFixed++;
      }
    }

    if (configsFixed > 0) {
      console.log(`\n⚠️  Configuraciones con problemas: ${configsFixed}`);
      console.log("   Estas requieren corrección manual en la BD\n");
    }

    // Resumen
    console.log("═══════════════════════════════════════");
    console.log("✅ CORRECCIÓN COMPLETADA");
    console.log("═══════════════════════════════════════");
    console.log(`   Cursos corregidos: ${coursesFixed}`);
    console.log(`   Snapshots corregidos: ${snapshotsFixed}`);

    if (configsFixed > 0) {
      console.log(`   Configs con problemas: ${configsFixed} (manual)`);
    }

    console.log("\n💡 Ejecuta el script de verificación para confirmar:");
    console.log("   npx tsx prisma/check-academic-levels.ts");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAcademicLevels();
