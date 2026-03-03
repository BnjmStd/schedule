import { redirect } from "next/navigation";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { countTeachers } from "@/modules/teachers/actions";
import { countCourses } from "@/modules/courses/actions";
import { countSchedules } from "@/modules/schedules/actions";
import { getSubjects } from "@/modules/subjects/actions";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // SUPER_ADMIN no pertenece a ningún colegio → panel global
  if (session.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Cualquier otro rol sin colegio asignado → aviso de configuración
  if (!session.schoolId) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: "1rem",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <span style={{ fontSize: "3rem" }}>🏫</span>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Sin colegio asignado
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 420 }}>
          Tu cuenta ({session.email}) tiene rol <strong>{session.role}</strong>{" "}
          pero aún no está asociada a ningún colegio. Pide a tu administrador
          que te asigne un colegio, o registra uno nuevo.
        </p>
        <a
          href="/auth/register"
          style={{
            marginTop: "0.5rem",
            padding: "0.6rem 1.5rem",
            background: "var(--accent,#6366f1)",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Registrar colegio
        </a>
      </div>
    );
  }

  // Cargar nombre del colegio y estadísticas en paralelo
  let schoolName = "Mi Colegio";
  let teachersCount = 0;
  let coursesCount = 0;
  let schedulesCount = 0;
  let subjectsCount = 0;

  try {
    const [school, subjects, teachers, courses, schedules] = await Promise.all([
      prisma.school.findUnique({
        where: { id: session.schoolId },
        select: { name: true },
      }),
      getSubjects(),
      countTeachers(),
      countCourses(),
      countSchedules(),
    ]);
    schoolName = school?.name ?? "Mi Colegio";
    subjectsCount = subjects.length;
    teachersCount = teachers;
    coursesCount = courses;
    schedulesCount = schedules;
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }

  const quickActions = [
    {
      icon: "🏫",
      title: "Mi Colegio",
      description: "Configuración institucional",
      href: "/schools",
    },
    {
      icon: "👨‍🏫",
      title: "Profesores",
      description: "Administra profesores",
      href: "/teachers",
    },
    {
      icon: "📚",
      title: "Asignaturas",
      description: "Catálogo de materias",
      href: "/subjects",
    },
    {
      icon: "🎓",
      title: "Cursos",
      description: "Cursos y secciones",
      href: "/courses",
    },
    {
      icon: "🗓️",
      title: "Horarios",
      description: "Gestiona horarios",
      href: "/schedules",
    },
    {
      icon: "📊",
      title: "Reportes",
      description: "Estadísticas y análisis",
      href: "/reports",
    },
  ];

  const stats = [
    { label: "Profesores", value: teachersCount.toString(), icon: "👨‍🏫" },
    { label: "Asignaturas", value: subjectsCount.toString(), icon: "📚" },
    { label: "Cursos", value: coursesCount.toString(), icon: "🎓" },
    { label: "Horarios", value: schedulesCount.toString(), icon: "🗓️" },
  ];

  return (
    <div className={styles["dashboard-page"]}>
      {/* Background */}
      <div className={styles["dashboard-bg"]}>
        <div className={styles["dashboard-gradient"]}></div>
        <div
          className={`${styles["dashboard-orb"]} ${styles["dashboard-orb-1"]}`}
        ></div>
        <div
          className={`${styles["dashboard-orb"]} ${styles["dashboard-orb-2"]}`}
        ></div>
      </div>

      {/* Main Content */}
      <main className={styles["dashboard-main"]}>
        {/* Welcome Section */}
        <div className={styles["dashboard-welcome"]}>
          <h1 className={styles["dashboard-title"]}>
            Bienvenido a {siteConfig.name}
          </h1>
          <p className={styles["dashboard-subtitle"]}>
            {schoolName} · {session.name ?? session.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className={styles["dashboard-stats-grid"]}>
          {stats.map((stat, index) => (
            <div key={index} className={styles["dashboard-stat-card"]}>
              <div className={styles["dashboard-stat-content"]}>
                <div className={styles["dashboard-stat-info"]}>
                  <p className={styles["dashboard-stat-label"]}>{stat.label}</p>
                  <p className={styles["dashboard-stat-value"]}>{stat.value}</p>
                </div>
                <div className={styles["dashboard-stat-icon"]}>{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className={styles["dashboard-section-title"]}>Acceso Rápido</h2>
          <div className={styles["dashboard-actions-grid"]}>
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className={styles["dashboard-action-card"]}
              >
                <div className={styles["dashboard-action-icon"]}>
                  {action.icon}
                </div>
                <h3 className={styles["dashboard-action-title"]}>
                  {action.title}
                </h3>
                <p className={styles["dashboard-action-description"]}>
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className={styles["dashboard-section-title"]}>
            Actividad Reciente
          </h2>
          <div className={styles["dashboard-activity-card"]}>
            <div className={styles["dashboard-empty-state"]}>
              <div className={styles["dashboard-empty-icon"]}>📊</div>
              <p className={styles["dashboard-empty-title"]}>
                No hay actividad reciente
              </p>
              <p className={styles["dashboard-empty-subtitle"]}>
                Comienza agregando profesores, asignaturas o cursos
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
