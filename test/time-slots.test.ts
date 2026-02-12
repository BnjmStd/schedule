/**
 * 🧪 Test: Generación de Time Slots con Recreos
 */

import { generateTimeSlotsWithBreaks, timeToMinutes } from '../src/lib/utils/time-slots';
import type { ScheduleLevelConfig } from '../src/types/schedule-config';

// Colores para output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';

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

function assertEqual(actual: any, expected: any, message: string) {
  if (actual === expected) {
    console.log(`${GREEN}✓${RESET} ${message}`);
    testsPassed++;
  } else {
    console.log(`${RED}✗${RESET} ${message}`);
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual: ${actual}`);
    testsFailed++;
  }
}

console.log(`${BLUE}╔══════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║  Test: Generación de Time Slots con Recreos  ║${RESET}`);
console.log(`${BLUE}╚══════════════════════════════════════════════╝${RESET}\n`);

// Test 1: Configuración BÁSICA
console.log(`${YELLOW}📋 Test 1: Configuración BÁSICA${RESET}`);
const basicConfig: ScheduleLevelConfig = {
  schoolId: 'test-school',
  academicLevel: 'BASIC',
  startTime: '08:00',
  endTime: '13:00',
  blockDuration: 45,
  breaks: [
    { afterBlock: 2, duration: 15, name: 'Recreo' },
    { afterBlock: 4, duration: 45, name: 'Almuerzo' },
  ],
};

const basicSlots = generateTimeSlotsWithBreaks(basicConfig);
console.log(`Slots generados: ${basicSlots.length}`);

// Verificar que hay bloques y recreos
const blocks = basicSlots.filter(s => s.type === 'block');
const breaks = basicSlots.filter(s => s.type === 'break');

assert(blocks.length > 0, 'Se generaron bloques');
assert(breaks.length === 2, 'Se generaron 2 recreos');
console.log(`  Bloques: ${blocks.length}, Recreos: ${breaks.length}`);

// Verificar estructura de bloques
blocks.forEach((block, idx) => {
  assert(block.time !== undefined, `Bloque ${idx + 1} tiene startTime`);
  assert(block.endTime !== undefined, `Bloque ${idx + 1} tiene endTime`);
  assert(block.blockNumber === idx + 1, `Bloque ${idx + 1} tiene número correcto`);
});

// Verificar que el recreo está después del bloque 2
const recreoIndex = basicSlots.findIndex(s => s.type === 'break' && s.breakName === 'Recreo');
const bloqueAntes = basicSlots.slice(0, recreoIndex).filter(s => s.type === 'block').length;
assertEqual(bloqueAntes, 2, 'Primer recreo está después del bloque 2');

// Verificar que el almuerzo está después del bloque 4
const almuerzoIndex = basicSlots.findIndex(s => s.type === 'break' && s.breakName === 'Almuerzo');
const bloquesAntesAlmuerzo = basicSlots.slice(0, almuerzoIndex).filter(s => s.type === 'block').length;
assertEqual(bloquesAntesAlmuerzo, 4, 'Almuerzo está después del bloque 4');

console.log('\nEstructura generada:');
basicSlots.forEach((slot, idx) => {
  if (slot.type === 'block') {
    console.log(`  ${idx + 1}. ${slot.time} - ${slot.endTime} | Bloque ${slot.blockNumber}`);
  } else {
    console.log(`  ${idx + 1}. ${slot.time} - ${slot.endTime} | ${YELLOW}${slot.breakName}${RESET}`);
  }
});

// Test 2: Configuración MEDIA
console.log(`\n${YELLOW}📋 Test 2: Configuración MEDIA${RESET}`);
const middleConfig: ScheduleLevelConfig = {
  schoolId: 'test-school',
  academicLevel: 'MIDDLE',
  startTime: '08:00',
  endTime: '14:00',
  blockDuration: 90,
  breaks: [
    { afterBlock: 2, duration: 15, name: 'Recreo' },
    { afterBlock: 3, duration: 45, name: 'Almuerzo' },
  ],
};

const middleSlots = generateTimeSlotsWithBreaks(middleConfig);
const middleBlocks = middleSlots.filter(s => s.type === 'block');
const middleBreaks = middleSlots.filter(s => s.type === 'break');

console.log(`Slots generados: ${middleSlots.length}`);
console.log(`  Bloques: ${middleBlocks.length}, Recreos: ${middleBreaks.length}`);

assert(middleBlocks.length > 0, 'Se generaron bloques para MEDIA');
assert(middleBreaks.length === 2, 'Se generaron 2 recreos para MEDIA');

// Verificar duración de bloques
middleBlocks.forEach((block, idx) => {
  const duration = timeToMinutes(block.endTime) - timeToMinutes(block.time);
  assertEqual(duration, 90, `Bloque ${idx + 1} tiene duración de 90 minutos`);
});

console.log('\nEstructura generada:');
middleSlots.forEach((slot, idx) => {
  if (slot.type === 'block') {
    console.log(`  ${idx + 1}. ${slot.time} - ${slot.endTime} | Bloque ${slot.blockNumber}`);
  } else {
    console.log(`  ${idx + 1}. ${slot.time} - ${slot.endTime} | ${YELLOW}${slot.breakName}${RESET}`);
  }
});

// Test 3: Sin recreos
console.log(`\n${YELLOW}📋 Test 3: Configuración SIN recreos${RESET}`);
const noBreaksConfig: ScheduleLevelConfig = {
  schoolId: 'test-school',
  academicLevel: 'BASIC',
  startTime: '08:00',
  endTime: '10:30',
  blockDuration: 45,
  breaks: [],
};

const noBreaksSlots = generateTimeSlotsWithBreaks(noBreaksConfig);
const noBreaksBlocks = noBreaksSlots.filter(s => s.type === 'block');
const noBreaksBreaks = noBreaksSlots.filter(s => s.type === 'break');

assertEqual(noBreaksBreaks.length, 0, 'No se generaron recreos');
assert(noBreaksBlocks.length > 0, 'Se generaron bloques sin recreos');
console.log(`  Bloques: ${noBreaksBlocks.length}, Recreos: ${noBreaksBreaks.length}`);

// Test 4: Verificar continuidad de tiempo
console.log(`\n${YELLOW}📋 Test 4: Continuidad de tiempo${RESET}`);
let lastEndTime = basicConfig.startTime;
let continuityOk = true;

for (let i = 0; i < basicSlots.length; i++) {
  const slot = basicSlots[i];
  if (slot.time !== lastEndTime) {
    console.log(`${RED}✗${RESET} Gap encontrado: esperado ${lastEndTime}, encontrado ${slot.time}`);
    continuityOk = false;
    testsFailed++;
    break;
  }
  lastEndTime = slot.endTime;
}

if (continuityOk) {
  console.log(`${GREEN}✓${RESET} Los slots son continuos sin gaps`);
  testsPassed++;
}

// Resumen
console.log(`\n${BLUE}╔══════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║              RESUMEN DE TESTS                 ║${RESET}`);
console.log(`${BLUE}╚══════════════════════════════════════════════╝${RESET}`);
console.log(`${GREEN}Pasados:${RESET} ${testsPassed}`);
console.log(`${RED}Fallidos:${RESET} ${testsFailed}`);
console.log(`${BLUE}Total:${RESET} ${testsPassed + testsFailed}\n`);

process.exit(testsFailed > 0 ? 1 : 0);
