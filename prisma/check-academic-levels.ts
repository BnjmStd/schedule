/**
 * 🔍 Script para verificar y reportar inconsistencias en academicLevel
 */

import { prisma } from "../src/lib/prisma";

const VALID_LEVELS = ["BASIC", "MIDDLE"];

async function checkAcademicLevels() {
  console.log("🔍 Verificando niveles académicos en la base de datos...\n");

  try {
    // 1. Verificar todos los cursos
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        academicLevel: true,
        schoolId: true,
      },
    });

    console.log(`📊 Total de cursos encontrados: ${courses.length}\n`);

    const invalidCourses = courses.filter(
      (c) => !VALID_LEVELS.includes(c.academicLevel),
    );

    if (invalidCourses.length > 0) {
      console.log(
        `❌ Cursos con academicLevel INVÁLIDO: ${invalidCourses.length}`,
      );
      invalidCourses.forEach((course) => {
        console.log(
          `   - ${course.name}: "${course.academicLevel}" (debe ser BASIC o MIDDLE)`,
        );
      });
      console.log();
    } else {
      console.log(`✅ Todos los cursos tienen academicLevel válido\n`);
    }

    // 2. Verificar distribución de niveles
    const basicCount = courses.filter(
      (c) => c.academicLevel === "BASIC",
    ).length;
    const middleCount = courses.filter(
      (c) => c.academicLevel === "MIDDLE",
    ).length;

    console.log("📈 Distribución de niveles:");
    console.log(`   BASIC: ${basicCount}`);
    console.log(`   MIDDLE: ${middleCount}`);
    console.log(`   Otros: ${invalidCourses.length}\n`);

    // 3. Verificar configuraciones de niveles
    const configs = await prisma.scheduleLevelConfig.findMany({
      select: {
        schoolId: true,
        academicLevel: true,
      },
    });

    console.log(`⚙️  Configuraciones de nivel encontradas: ${configs.length}`);
    const invalidConfigs = configs.filter(
      (c) => !VALID_LEVELS.includes(c.academicLevel),
    );

    if (invalidConfigs.length > 0) {
      console.log(
        `❌ Configuraciones con academicLevel INVÁLIDO: ${invalidConfigs.length}`,
      );
      invalidConfigs.forEach((config) => {
        console.log(
          `   - School ${config.schoolId}: "${config.academicLevel}"`,
        );
      });
      console.log();
    } else {
      console.log(`✅ Todas las configuraciones son válidas\n`);
    }

    // 4. Verificar schedules con configSnapshot
    const schedules = await prisma.schedule.findMany({
      where: {
        configSnapshot: { not: null },
      },
      select: {
        id: true,
        name: true,
        configSnapshot: true,
      },
    });

    console.log(`📅 Schedules con configSnapshot: ${schedules.length}`);
    let invalidSnapshots = 0;

    schedules.forEach((schedule) => {
      try {
        const snapshot = JSON.parse(schedule.configSnapshot!);
        if (
          snapshot.academicLevel &&
          !VALID_LEVELS.includes(snapshot.academicLevel)
        ) {
          console.log(
            `   ⚠️  ${schedule.name}: snapshot tiene "${snapshot.academicLevel}"`,
          );
          invalidSnapshots++;
        }
      } catch (e) {
        console.log(
          `   ⚠️  ${schedule.name}: snapshot inválido (JSON corrupto)`,
        );
        invalidSnapshots++;
      }
    });

    if (invalidSnapshots === 0) {
      console.log("✅ Todos los snapshots son válidos\n");
    } else {
      console.log(`❌ ${invalidSnapshots} snapshots con problemas\n`);
    }

    // Resumen
    console.log("═══════════════════════════════════════");
    console.log("📋 RESUMEN");
    console.log("═══════════════════════════════════════");

    const totalIssues =
      invalidCourses.length + invalidConfigs.length + invalidSnapshots;

    if (totalIssues === 0) {
      console.log("✅ No se encontraron problemas");
      console.log("   Todos los datos usan BASIC o MIDDLE correctamente");
    } else {
      console.log(`❌ Total de problemas encontrados: ${totalIssues}`);
      console.log("\n💡 Para corregir, ejecuta:");
      console.log("   npx tsx prisma/fix-academic-levels.ts");
    }
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkAcademicLevels();
