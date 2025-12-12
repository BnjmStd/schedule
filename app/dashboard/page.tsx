import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const quickActions = [
    {
      icon: "🏫",
      title: "Colegios",
      description: "Gestiona instituciones",
      href: "/schools",
      color: "from-primary-400 to-primary-600",
    },
    {
      icon: "👨‍🏫",
      title: "Profesores",
      description: "Administra profesores",
      href: "/teachers",
      color: "from-secondary-400 to-secondary-600",
    },
    {
      icon: "📚",
      title: "Asignaturas",
      description: "Catálogo de materias",
      href: "/subjects",
      color: "from-accent-400 to-accent-600",
    },
    {
      icon: "🎓",
      title: "Cursos",
      description: "Cursos y secciones",
      href: "/courses",
      color: "from-success-400 to-success-600",
    },
    {
      icon: "🗓️",
      title: "Horarios",
      description: "Gestiona horarios",
      href: "/schedules",
      color: "from-warning-400 to-warning-600",
    },
    {
      icon: "📊",
      title: "Reportes",
      description: "Estadísticas y análisis",
      href: "/reports",
      color: "from-danger-400 to-danger-600",
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">📅</span>
              </div>
              <span className="text-xl font-bold bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                {siteConfig.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">
                👋 Hola, {session.user.name || session.user.email}
              </span>
              <Link href="/api/auth/signout">
                <Button variant="outline" size="sm">
                  Cerrar Sesión
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            Bienvenido a tu panel de control
          </h1>
          <p className="text-xl text-neutral-600">
            Gestiona todo tu sistema educativo desde aquí
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Colegios", value: "3", icon: "🏫", color: "primary" },
            {
              label: "Profesores",
              value: "45",
              icon: "👨‍🏫",
              color: "secondary",
            },
            { label: "Cursos", value: "28", icon: "🎓", color: "accent" },
            { label: "Horarios", value: "12", icon: "🗓️", color: "success" },
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`text-4xl opacity-50`}>{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Acceso Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-linear-to-br ${action.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}
                    >
                      {action.icon}
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-neutral-600">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Actividad Reciente
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12 text-neutral-500">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-lg">No hay actividad reciente</p>
                <p className="text-sm mt-2">
                  Comienza creando un colegio o agregando profesores
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
