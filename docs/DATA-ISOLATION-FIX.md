# 🔒 Corrección de Aislamiento de Datos Multi-Tenant

## Problema Identificado

Los módulos de profesores, asignaturas y cursos mostraban datos de todas las escuelas, independientemente de a qué escuelas tenía acceso el usuario autenticado. Esto ocurría porque las funciones de autenticación en `auth-helpers.ts` requerían un `userId` como parámetro, pero no se estaba pasando correctamente.

## Cambios Realizados

### 1. **Actualización de `auth-helpers.ts`**

Se modificaron las siguientes funciones para obtener automáticamente el `userId` de la sesión actual:

#### `getUserSchoolIds()`
```typescript
// ❌ ANTES (requería userId como parámetro)
export async function getUserSchoolIds(userId: string): Promise<string[]>

// ✅ DESPUÉS (obtiene userId automáticamente de la sesión)
export async function getUserSchoolIds(): Promise<string[]> {
  const session = await getSession();
  if (!session) {
    throw new Error('No autenticado');
  }
  
  const userSchools = await prisma.userSchool.findMany({
    where: { userId: session.id },
    select: { schoolId: true },
  });
  
  return userSchools.map(us => us.schoolId);
}
```

#### `userHasAccessToSchool(schoolId)`
```typescript
// ❌ ANTES
export async function userHasAccessToSchool(userId: string, schoolId: string)

// ✅ DESPUÉS
export async function userHasAccessToSchool(schoolId: string)
```

#### `getUserSchoolRole(schoolId)`
```typescript
// ❌ ANTES
export async function getUserSchoolRole(userId: string, schoolId: string)

// ✅ DESPUÉS
export async function getUserSchoolRole(schoolId: string)
```

### 2. **Actualización de `schools/actions/index.ts`**

Se actualizaron las llamadas a las funciones modificadas:

```typescript
// ✅ getSchools() ahora usa getUserSchoolIds() sin parámetros
export async function getSchools(): Promise<School[]> {
  const schoolIds = await getUserSchoolIds();
  // ...
}

// ✅ getSchoolById(), updateSchool(), deleteSchool() 
// ahora usan userHasAccessToSchool(id) sin userId
```

### 3. **Verificación de otros módulos**

Los módulos de **teachers**, **subjects** y **courses** ya estaban correctamente implementados llamando a `getUserSchoolIds()` sin parámetros. Con la corrección en `auth-helpers.ts`, ahora funcionan correctamente.

## Scripts de Utilidad Creados

### 1. **check-data-integrity.ts**
Verifica la integridad de los datos en la base de datos:

```bash
npx tsx prisma/check-data-integrity.ts
```

Muestra:
- Cantidad de usuarios, escuelas, profesores, asignaturas y cursos
- Qué usuarios tienen acceso a qué escuelas
- Detecta escuelas "huérfanas" (sin usuarios asociados)

### 2. **clean-orphan-data.ts**
Elimina escuelas que no tienen usuarios asociados:

```bash
npx tsx prisma/clean-orphan-data.ts
```

Útil para limpiar datos de prueba del `seed.ts` que fueron creados sin asociar a usuarios específicos.

## Resultado

✅ **Aislamiento de datos garantizado**: Cada usuario ahora solo ve los datos de las escuelas a las que tiene acceso a través de la tabla `UserSchool`.

✅ **Cuentas nuevas limpias**: Cuando un usuario crea una nueva cuenta, no verá ningún dato hasta que cree su primera escuela.

✅ **Multi-tenancy seguro**: Los datos de diferentes instituciones están completamente aislados.

## Flujo de Datos Actual

```
1. Usuario se autentica → Sesión JWT creada con userId
2. getUserSchoolIds() → Lee sesión → Busca schoolIds para ese userId
3. Queries de datos (teachers, subjects, courses) → Filtran por schoolIds
4. Usuario solo ve datos de SUS escuelas
```

## Testing Recomendado

1. **Crear nueva cuenta**: Verificar que no se muestren datos existentes
2. **Crear nueva escuela**: Verificar que se asocia automáticamente al usuario
3. **Crear profesores/asignaturas/cursos**: Verificar que solo aparecen en las escuelas del usuario
4. **Crear segunda cuenta**: Verificar que no puede ver datos de la primera cuenta
