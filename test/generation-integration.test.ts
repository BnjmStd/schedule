/**
 * 🧪 Test de Integración: Verificar compatibilidad entre generación y visualización
 */

import { generateTimeSlotsWithBreaks } from '../src/lib/utils/time-slots';
import type { ScheduleLevelConfig } from '../src/types/schedule-config';

// Colores para output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const CYAN = '\x1b[36m';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${message}`);
    testsPassed++;
  } else {
    console.log(`${RED}✗${RESET} ${message}`);
    testsFailed++;
  }
}

console.log(`${BLUE}╔════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║  Test: Integración Generación vs Visualización         ║${RESET}`);
console.log(`${BLUE}╚════════════════════════════════════════════════════════╝${RESET}\n`);

// Simular configuración de un colegio
const schoolConfig: ScheduleLevelConfig = {
  schoolId: 'school-123',
  academicLevel: 'BASIC',
  startTime: '08:00',
  endTime: '17:00',
  blockDuration: 45,
  breaks: [
    { afterBlock: 2, duration: 15, name: 'Recreo' },
    { afterBlock: 4, duration: 15, name: 'Recreo' },
    { afterBlock: 6, duration: 45, name: 'Almuerzo' },
  ],
};

console.log(`${CYAN}📊 Configuración del Colegio:${RESET}`);
console.log(`   Nivel: ${schoolConfig.academicLevel}`);
console.log(`   Horario: ${schoolConfig.startTime} - ${schoolConfig.endTime}`);
console.log(`   Bloque: ${schoolConfig.blockDuration} min`);
console.log(`   Recreos: ${schoolConfig.breaks.length}`);
schoolConfig.breaks.forEach((b, i) => {
  console.log(`     ${i + 1}. ${b.name} (${b.duration} min) después del bloque ${b.afterBlock}`);
});
console.log();

// Test 1: Generar slots para el EDITOR
console.log(`${YELLOW}📋 Test 1: Slots para el Editor (UI)${RESET}`);
const editorSlots = generateTimeSlotsWithBreaks(schoolConfig);
const editorBlocks = editorSlots.filter(s => s.type === 'block');
const editorBreaks = editorSlots.filter(s => s.type === 'break');

console.log(`Total slots generados: ${editorSlots.length}`);
console.log(`  - Bloques: ${editorBlocks.length}`);
console.log(`  - Recreos: ${editorBreaks.length}`);

assert(editorBlocks.length > 0, 'Editor: Se generaron bloques');
assert(editorBreaks.length === 3, 'Editor: Se generaron 3 recreos');

// Test 2: Verificar que los bloques generados pueden ubicarse en los slots del editor
console.log(`\n${YELLOW}📋 Test 2: Compatibilidad Bloques Generados${RESET}`);

// Simular bloques generados por el algoritmo de generación
const generatedBlocks = [
  { day: 'MONDAY', startTime: '08:00', endTime: '08:45', subject: 'Matemáticas' },
  { day: 'MONDAY', startTime: '08:45', endTime: '09:30', subject: 'Lenguaje' },
  // Después del recreo de 15 min (09:30-09:45)
  { day: 'MONDAY', startTime: '09:45', endTime: '10:30', subject: 'Historia' },
  { day: 'MONDAY', startTime: '10:30', endTime: '11:15', subject: 'Ciencias' },
  // Después del recreo de 15 min (11:15-11:30)
  { day: 'MONDAY', startTime: '11:30', endTime: '12:15', subject: 'Inglés' },
  { day: 'MONDAY', startTime: '12:15', endTime: '13:00', subject: 'Música' },
  // Después del almuerzo de 45 min (13:00-13:45)
  { day: 'MONDAY', startTime: '13:45', endTime: '14:30', subject: 'Educación Física' },
];

console.log(`Bloques generados a verificar: ${generatedBlocks.length}`);

let allBlocksFitInSlots = true;
generatedBlocks.forEach((block, idx) => {
  // Buscar si existe un slot del editor que coincida exactamente
  const matchingSlot = editorBlocks.find(
    slot => slot.time === block.startTime && slot.endTime === block.endTime
  );

  if (matchingSlot) {
    console.log(`${GREEN}✓${RESET} Bloque ${idx + 1} (${block.startTime}-${block.endTime}) encaja en slot ${matchingSlot.blockNumber}`);
    testsPassed++;
  } else {
    console.log(`${RED}✗${RESET} Bloque ${idx + 1} (${block.startTime}-${block.endTime}) NO tiene slot correspondiente`);
    allBlocksFitInSlots = false;
    testsFailed++;
  }
});

assert(allBlocksFitInSlots, 'Todos los bloques generados encajan en slots del editor');

// Test 3: Verificar que no se generan bloques durante recreos
console.log(`\n${YELLOW}📋 Test 3: No hay bloques durante recreos${RESET}`);

let noBlocksDuringBreaks = true;
generatedBlocks.forEach((block, idx) => {
  // Verificar si este bloque se solapa con algún recreo
  const overlapsBreak = editorBreaks.some(breakSlot => {
    const blockStart = timeToMinutes(block.startTime);
    const blockEnd = timeToMinutes(block.endTime);
    const breakStart = timeToMinutes(breakSlot.time);
    const breakEnd = timeToMinutes(breakSlot.endTime);

    return (blockStart >= breakStart && blockStart < breakEnd) ||
           (blockEnd > breakStart && blockEnd <= breakEnd) ||
           (blockStart <= breakStart && blockEnd >= breakEnd);
  });

  if (overlapsBreak) {
    console.log(`${RED}✗${RESET} Bloque ${idx + 1} se solapa con recreo`);
    noBlocksDuringBreaks = false;
    testsFailed++;
  }
});

if (noBlocksDuringBreaks) {
  console.log(`${GREEN}✓${RESET} Ningún bloque se solapa con recreos`);
  testsPassed++;
}

// Test 4: Mostrar estructura completa del día
console.log(`\n${YELLOW}📋 Test 4: Estructura completa de la jornada${RESET}\n`);

console.log(`${CYAN}Estructura de slots del editor:${RESET}`);
editorSlots.forEach((slot, idx) => {
  if (slot.type === 'block') {
    console.log(`  ${String(idx + 1).padStart(2, ' ')}. ${slot.time} - ${slot.endTime} │ ${GREEN}Bloque ${slot.blockNumber}${RESET}`);
  } else {
    console.log(`  ${String(idx + 1).padStart(2, ' ')}. ${slot.time} - ${slot.endTime} │ ${YELLOW}${slot.breakName}${RESET}`);
  }
});

// Verificar que recreos están en posiciones correctas
console.log(`\n${CYAN}Verificación de recreos:${RESET}`);
schoolConfig.breaks.forEach((breakConfig, idx) => {
  const slotsBefore = editorSlots.slice(0).filter(s => s.type === 'block');
  const breakSlot = editorBreaks[idx];
  
  if (breakSlot) {
    // Contar cuántos bloques hay antes de este recreo
    const breakIndex = editorSlots.indexOf(breakSlot);
    const blocksBeforeBreak = editorSlots.slice(0, breakIndex).filter(s => s.type === 'block').length;
    
    if (blocksBeforeBreak === breakConfig.afterBlock) {
      console.log(`${GREEN}✓${RESET} ${breakSlot.breakName} está correctamente después del bloque ${breakConfig.afterBlock}`);
      testsPassed++;
    } else {
      console.log(`${RED}✗${RESET} ${breakSlot.breakName} está después del bloque ${blocksBeforeBreak}, esperado ${breakConfig.afterBlock}`);
      testsFailed++;
    }
  }
});

// Resumen
console.log(`\n${BLUE}╔════════════════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║                   RESUMEN DE TESTS                      ║${RESET}`);
console.log(`${BLUE}╚════════════════════════════════════════════════════════╝${RESET}`);
console.log(`${GREEN}Pasados:${RESET} ${testsPassed}`);
console.log(`${RED}Fallidos:${RESET} ${testsFailed}`);
console.log(`${BLUE}Total:${RESET} ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log(`\n${GREEN}🎉 ¡Todos los tests pasaron! La integración es correcta.${RESET}\n`);
} else {
  console.log(`\n${RED}⚠️  Algunos tests fallaron. Revisar la implementación.${RESET}\n`);
}

// Helper function
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

process.exit(testsFailed > 0 ? 1 : 0);
