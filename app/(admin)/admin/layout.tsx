/**
 * 🏛️ Admin Layout — Server Component
 *
 * Verifica el rol de administrador en el servidor.
 * El middleware ya bloquea la ruta, pero verificar aquí
 * provee defensa en profundidad.
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdminRole } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Panel de Administración — BBschedule",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login?redirect=/admin");
  }

  if (!isAdminRole(session.role)) {
    redirect("/dashboard");
  }

  return (
    <AdminShell
      userName={session.name || session.email}
      userRole={session.role}
    >
      {children}
    </AdminShell>
  );
}
