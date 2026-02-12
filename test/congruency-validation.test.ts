/**
 * 🧪 Test: Validación de Congruencia de Jornadas
 * Verifica que curso y profesor tengan jornadas compatibles
 */

import { prisma } from '../src/lib/prisma';

// Colores para output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

async function testCongruency() {
  console.log(`${BLUE}╔═══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BLUE}║  Test: Congruencia de Jornadas Curso-Profesor    ║${RESET}`);
  console.log(`${BLUE}╚═══════════════════════════════════════════════════╝${RESET}\n`);

  try {
    // Obtener todas las escuelas
    const schools = await prisma.school.findMany({
      take: 1, // Probar con la primera escuela
    });

    if (schools.length === 0) {
      console.log(`${YELLOW}⚠️  No hay escuelas en la BD para testear${RESET}\n`);
      return;
    }

    const school = schools[0];
    console.log(`${CYAN}🏫 Escuela: ${school.name}${RESET}\n`);

    // 1. Verificar configuraciones de jornada
    console.log(`${YELLOW}📋 Test 1: Configuraciones de Jornada${RESET}`);
    const configs = await prisma.scheduleLevelConfig.findMany({
      where: { schoolId: school.id },
    });

    console.log(`Configuraciones encontradas: ${configs.length}`);
    configs.forEach((config) => {
      console.log(`  ${GREEN}✓${RESET} ${config.academicLevel}: ${config.startTime} - ${config.endTime} (bloques de ${config.blockDuration} min)`);
    });

    if (configs.length === 0) {
      console.log(`${YELLOW}  ℹ️  No hay configuraciones, usando valores por defecto${RESET}`);
    }

    // 2. Verificar historial
    console.log(`\n${YELLOW}📋 Test 2: Historial de Cambios${RESET}`);
    if (configs.length > 0) {
      const history = await prisma.scheduleLevelConfigHistory.findMany({
        where: { configId: configs[0].id },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (history.length > 0) {
        console.log(`Historial encontrado: ${history.length} cambios`);
        history.forEach((h, idx) => {
          console.log(`  ${idx + 1}. ${h.createdAt.toISOString().split('T')[0]} - ${h.startTime} - ${h.endTime}`);
          if (h.changeReason) {
            console.log(`     Razón: ${h.changeReason}`);
          }
        });
      } else {
        console.log(`  ${YELLOW}ℹ️  No hay historial de cambios aún${RESET}`);
      }
    }

    // 3. Verificar congruencia curso-profesor
    console.log(`\n${YELLOW}📋 Test 3: Congruencia Curso-Profesor${RESET}`);
    
    // Obtener profesores con sus bloques
    const teachers = await prisma.teacher.findMany({
      where: { schoolId: school.id },
      include: {
        scheduleBlocks: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                academicLevel: true,
              },
            },
          },
        },
      },
    });

    console.log(`Profesores encontrados: ${teachers.length}`);

    let issuesFound = 0;
    for (const teacher of teachers) {
      const teacherName = `${teacher.firstName} ${teacher.lastName}`;
      
      if (teacher.scheduleBlocks.length === 0) {
        continue;
      }

      // Obtener niveles académicos únicos
      const courseLevels = new Set(
        teacher.scheduleBlocks.map((b) => b.course.academicLevel)
      );

      if (courseLevels.size > 1) {
        console.log(`\n  ${YELLOW}⚠️  ${teacherName}${RESET}`);
        console.log(`     Asignado a ${courseLevels.size} niveles diferentes:`);
        
        for (const level of courseLevels) {
          const courses = teacher.scheduleBlocks
            .filter((b) => b.course.academicLevel === level)
            .map((b) => b.course.name);
          
          const uniqueCourses = Array.from(new Set(courses));
          console.log(`       - ${level}: ${uniqueCourses.length} cursos`);
          uniqueCourses.forEach((c) => console.log(`          • ${c}`));
        }

        // Obtener configs de esos niveles
        const levelConfigs = await prisma.scheduleLevelConfig.findMany({
          where: {
            schoolId: school.id,
            academicLevel: { in: Array.from(courseLevels) },
          },
        });

        if (levelConfigs.length > 1) {
          const startTimes = new Set(levelConfigs.map((c) => c.startTime));
          const endTimes = new Set(levelConfigs.map((c) => c.endTime));

          if (startTimes.size > 1 || endTimes.size > 1) {
            console.log(`     ${RED}❌ CONFLICTO: Jornadas incompatibles${RESET}`);
            levelConfigs.forEach((c) => {
              console.log(`       ${c.academicLevel}: ${c.startTime} - ${c.endTime}`);
            });
            issuesFound++;
          } else {
            console.log(`     ${GREEN}✓ Jornadas compatibles${RESET}`);
          }
        }
      }
    }

    if (issuesFound === 0) {
      console.log(`\n  ${GREEN}✓ No se encontraron conflictos de jornada${RESET}`);
    } else {
      console.log(`\n  ${RED}✗ ${issuesFound} conflictos encontrados${RESET}`);
    }

    // 4. Verificar schedules obsoletos
    console.log(`\n${YELLOW}📋 Test 4: Schedules Obsoletos${RESET}`);
    const deprecatedCount = await prisma.schedule.count({
      where: {
        schoolId: school.id,
        isDeprecated: true,
        isActive: true,
      },
    });

    const totalSchedules = await prisma.schedule.count({
      where: {
        schoolId: school.id,
        isActive: true,
      },
    });

    console.log(`Schedules obsoletos: ${deprecatedCount}/${totalSchedules}`);
    
    if (deprecatedCount > 0) {
      console.log(`  ${YELLOW}⚠️  Hay ${deprecatedCount} horarios que necesitan actualización${RESET}`);
      
      const deprecated = await prisma.schedule.findMany({
        where: {
          schoolId: school.id,
          isDeprecated: true,
          isActive: true,
        },
        include: {
          course: {
            select: { name: true, academicLevel: true },
          },
        },
        take: 5,
      });

      deprecated.forEach((s) => {
        console.log(`     - ${s.course.name} (${s.course.academicLevel})`);
      });
    } else {
      console.log(`  ${GREEN}✓ Todos los schedules están actualizados${RESET}`);
    }

    // Resumen final
    console.log(`\n${BLUE}╔═══════════════════════════════════════════════════╗${RESET}`);
    console.log(`${BLUE}║                 RESUMEN                           ║${RESET}`);
    console.log(`${BLUE}╚═══════════════════════════════════════════════════╝${RESET}`);
    console.log(`${GREEN}Configuraciones:${RESET} ${configs.length}`);
    console.log(`${GREEN}Profesores:${RESET} ${teachers.length}`);
    console.log(`${GREEN}Schedules activos:${RESET} ${totalSchedules}`);
    console.log(`${YELLOW}Schedules obsoletos:${RESET} ${deprecatedCount}`);
    console.log(`${RED}Conflictos encontrados:${RESET} ${issuesFound}\n`);

  } catch (error) {
    console.error(`${RED}Error en test:${RESET}`, error);
  } finally {
    await prisma.$disconnect();
  }
}

testCongruency();
