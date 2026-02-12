# 🧪 Tests de Horarios

Tests para verificar la consistencia entre generación y visualización de horarios.

## Archivos

- **`time-slots.test.ts`**: Tests unitarios de generación de slots
- **`generation-integration.test.ts`**: Tests de integración entre generación y UI

## Ejecutar Tests

```bash
# Test unitario de time slots
npm run test:time-slots

# Test de integración
npm run test:integration

# Todos los tests
npm run test
```

## Lo que se verifica

### Time Slots (Unitarios)
- ✅ Generación correcta de bloques y recreos
- ✅ Recreos en posiciones especificadas
- ✅ Duración correcta de bloques
- ✅ Continuidad sin gaps

### Integración
- ✅ Bloques generados encajan en slots del editor
- ✅ No hay bloques durante recreos
- ✅ Recreos respetan configuración del colegio
- ✅ Compatibilidad generación vs visualización

## Resultados Esperados

```
╔════════════════════════════════════════════════════════╗
║                   RESUMEN DE TESTS                      ║
╚════════════════════════════════════════════════════════╝
Pasados: XX
Fallidos: 0
Total: XX

🎉 ¡Todos los tests pasaron! La integración es correcta.
```
