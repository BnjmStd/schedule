# 🎉 EduSchedule - Sistema SaaS de Gestión de Horarios Escolares

## ✨ Características Implementadas

### 🏠 Landing Page Atractiva
- Hero section con animaciones sutiles
- Sección de características con iconos
- Estadísticas (stats) animadas
- Tabla de precios (3 planes)
- Call-to-action sections
- Footer completo
- Diseño responsivo y moderno

### 🔐 Sistema de Autenticación
- **Login** (`/auth/login`)
- **Registro** (`/auth/register`)
- NextAuth.js v5 configurado
- Protección de rutas con middleware
- Sesiones JWT
- Hash de contraseñas con bcryptjs

### 📊 Dashboard Principal
- Vista después del login
- Quick actions a todas las secciones
- Cards de estadísticas
- Actividad reciente (placeholder)
- Diseño limpio y profesional

### 🏫 Módulos Protegidos
Todos estos módulos requieren autenticación:
- **Colegios** - `/schools`
- **Profesores** - `/teachers`
- **Asignaturas** - `/subjects`
- **Cursos** - `/courses`
- **Horarios** - `/schedules`
- **Reportes** - `/reports`

### 🗄️ Base de Datos Multi-Tenant
- Modelo de **User** con autenticación
- Modelo de **Session** para NextAuth
- Modelo **UserSchool** para relación usuario-colegio (multi-tenant)
- Cada usuario puede gestionar múltiples colegios
- Roles: user, admin, super_admin

## 🚀 Inicio Rápido

### Credenciales de Demo
```
Email: demo@eduschedule.com
Password: demo1234
```

### Rutas Principales

#### Públicas (sin autenticación)
- `/` - Landing page
- `/auth/login` - Iniciar sesión
- `/auth/register` - Crear cuenta

#### Protegidas (requieren login)
- `/dashboard` - Panel principal
- `/schools` - Gestión de colegios
- `/teachers` - Gestión de profesores
- `/subjects` - Gestión de asignaturas
- `/courses` - Gestión de cursos
- `/schedules` - Gestión de horarios
- `/reports` - Reportes y estadísticas

## 📂 Estructura de Archivos

```
app/
├── (protected)/           # Rutas protegidas con Navbar
│   ├── schools/
│   ├── teachers/
│   ├── subjects/
│   ├── courses/
│   ├── schedules/
│   └── reports/
├── auth/                  # Páginas de autenticación
│   ├── login/
│   └── register/
├── dashboard/             # Dashboard principal
├── api/
│   └── auth/
│       ├── [...nextauth]/ # NextAuth handlers
│       └── register/      # Endpoint de registro
├── page.tsx               # Landing page
└── layout.tsx             # Layout raíz

src/
├── lib/
│   ├── auth.ts           # Configuración NextAuth
│   └── prisma.ts         # Cliente Prisma
├── components/
│   ├── ui/               # Componentes UI reutilizables
│   └── layout/           # Componentes de layout
└── types/
    └── next-auth.d.ts    # Types de NextAuth

prisma/
├── schema.prisma         # Schema con User, Session, UserSchool
├── seed.ts               # Seed de datos escolares
└── seed-user.ts          # Seed de usuario demo

middleware.ts             # Protección de rutas
```

## 🎨 Diseño y UI

### Paleta de Colores Pastel
- **Primary** (azul pastel)
- **Secondary** (lavanda)
- **Accent** (rosa/coral)
- **Success** (verde menta)
- **Warning** (amarillo suave)
- **Danger** (rojo rosado)

### Componentes UI
- **Button** - 8 variantes, 3 tamaños, loading states
- **Card** - Con subcomponentes (Header, Content, Footer)
- **Badge** - 7 variantes de color
- **Input** - Con labels, errores, help text
- **Select** - Dropdown personalizado

## 🔧 Tecnologías

- **Next.js 16** - React Server Components, App Router
- **NextAuth.js v5** - Autenticación
- **Prisma 7** - ORM con better-sqlite3 adapter
- **SQLite** - Base de datos
- **Tailwind CSS v4** - @theme directive
- **TypeScript** - Tipado estricto
- **bcryptjs** - Hash de contraseñas
- **zod** - Validación de esquemas

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Base de datos
npm run db:push          # Sincronizar schema
npm run db:generate      # Generar cliente Prisma
npm run db:seed          # Poblar datos escolares
npm run db:seed:user     # Crear usuario demo
npm run db:studio        # Abrir Prisma Studio

# Producción
npm run build
npm start
```

## 🔐 Variables de Entorno

```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production-minimum-32-chars"
```

## 🎯 Flujo de Usuario

1. **Primera visita** → Landing page con info del producto
2. **Registro** → Crear cuenta en `/auth/register`
3. **Login** → Iniciar sesión en `/auth/login`
4. **Dashboard** → Vista principal con quick actions
5. **Módulos** → Acceso a schools, teachers, subjects, etc.

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcryptjs (12 rounds)
- ✅ Sesiones JWT con NextAuth
- ✅ Middleware protegiendo rutas privadas
- ✅ Validación de inputs con zod
- ✅ SQL injection prevention (Prisma)
- ✅ XSS prevention (React)

## 🌟 Próximos Pasos Sugeridos

1. **Implementar recuperación de contraseña**
2. **Agregar OAuth providers** (Google, GitHub)
3. **Dashboard con estadísticas reales** (gráficos)
4. **Notificaciones en tiempo real**
5. **Exportación de horarios** (PDF, Excel)
6. **Calendario interactivo drag-and-drop**
7. **Modo oscuro**
8. **Roles y permisos granulares**
9. **Auditoría de cambios**
10. **Integración con Google Calendar**

## 📸 Screenshots

### Landing Page
- Hero con CTA prominente
- Grid de características (6 features)
- Stats section con gradiente
- Pricing table (3 planes)
- Footer completo

### Auth Pages
- Login con email/password
- Registro con validación
- UI limpia y profesional

### Dashboard
- Welcome section
- 4 stats cards
- 6 quick action cards
- Recent activity section

## 🐛 Troubleshooting

### El middleware da error
Asegúrate de que el middleware no use Node.js APIs. Usa solo Web APIs compatibles con Edge Runtime.

### No puedo hacer login
Verifica que:
1. El usuario existe en la BD
2. La contraseña es correcta
3. NEXTAUTH_SECRET está configurado

### Las rutas protegidas no redirigen
Verifica que el middleware esté corriendo y que las cookies de sesión se estén guardando.

## 📚 Documentación Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Desarrollado con ❤️ usando Next.js 16 + React 19 + Prisma 7**
