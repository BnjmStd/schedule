/**
 * 🔒 API Route: /api/cron/expire-subscriptions
 *
 * Invocada por el scheduler externo (Vercel Cron, Railway Cron, GitHub Actions, crontab).
 *
 * Seguridad:
 *   - Requiere header `Authorization: Bearer <CRON_SECRET>` o
 *     query param `?secret=<CRON_SECRET>`.
 *   - CRON_SECRET debe estar en las variables de entorno del servidor
 *     (nunca expuesto al cliente).
 *
 * Configuración en vercel.json (si usas Vercel):
 *   {
 *     "crons": [{ "path": "/api/cron/expire-subscriptions", "schedule": "0 3 * * *" }]
 *   }
 *
 * El método GET es intencional para compatibilidad con la mayoría de schedulers
 * que hacen HTTP GET a una URL. Si el scheduler soporta POST úsalo prefiriendo POST.
 */

import { NextRequest, NextResponse } from "next/server";
import { run } from "@/jobs/cron/expire-subscriptions";

// ─── Constante de autenticación ───────────────────────────────────────────────
const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    // Si no está configurado el secret, solo permitir en desarrollo local
    if (process.env.NODE_ENV === "development") return true;
    console.error(
      "[cron/expire-subscriptions] CRON_SECRET no está configurado en producción",
    );
    return false;
  }

  // Verificar header Authorization: Bearer <secret>
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${CRON_SECRET}`) return true;

  // Verificar query param ?secret=<secret> (para schedulers que no soportan headers)
  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret === CRON_SECRET) return true;

  return false;
}

// ─── Handler GET ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const result = await run();

    const statusCode = result.errors.length > 0 ? 207 : 200; // 207 Multi-Status si hubo errores parciales

    return NextResponse.json(
      {
        ok: true,
        job: "expire-subscriptions",
        ...result,
      },
      { status: statusCode },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    console.error("[cron/expire-subscriptions] Error fatal:", message);

    return NextResponse.json(
      { ok: false, job: "expire-subscriptions", error: message },
      { status: 500 },
    );
  }
}

// Algunos schedulers (ej. Railway) usan POST
export const POST = GET;
