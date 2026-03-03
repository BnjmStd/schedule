#!/usr/bin/env -S tsx

/**
 * Script para crear/actualizar un usuario con rol admin / super_admin
 * Uso:
 *  npx tsx script/create-admin.ts --email=admin@example.com --name="Admin" --role=ADMIN --password=secret [--schoolId=xxx]
 *
 * Roles válidos (case-insensitive): OWNER, ADMIN, SUPER_ADMIN, STAFF, VIEWER
 * SUPER_ADMIN no necesita --schoolId. Los demás roles sí lo necesitan para
 * poder acceder al dashboard tras el login.
 *
 * Si el usuario existe: actualiza el rol (y la contraseña si se pasa).
 * Si no existe: lo crea con la contraseña indicada o una aleatoria.
 */

import "dotenv/config";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string | boolean> = {};
  for (const a of args) {
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      if (eq === -1) {
        out[a.slice(2)] = true;
      } else {
        const k = a.slice(2, eq);
        const v = a.slice(eq + 1);
        out[k] = v;
      }
    }
  }
  return out;
}

function generatePassword() {
  return randomBytes(8).toString("base64").replace(/\W/g, "A");
}

async function main() {
  const args = parseArgs();
  const email = String(args.email || args.e || args.user || "").trim();
  const name = (args.name as string) || (args.n as string) || "Admin";
  const role = String(args.role || args.r || "ADMIN").toUpperCase();
  const passArg = args.password || args.p;
  const schoolId = (args.schoolId || args.school) as string | undefined;

  if (!email) {
    console.error("Error: --email is required");
    process.exit(2);
  }

  const VALID_ROLES = ["OWNER", "ADMIN", "SUPER_ADMIN", "STAFF", "VIEWER"];
  if (!VALID_ROLES.includes(role)) {
    console.error(
      `Error: --role must be one of: ${VALID_ROLES.join(", ")} (case-insensitive)`,
    );
    process.exit(2);
  }

  if (role !== "SUPER_ADMIN" && !schoolId) {
    console.warn(
      `⚠️  Warning: --schoolId not provided. The user will log in but won't be able to access the dashboard. Pass --schoolId=<id> to associate them with a school.`,
    );
  }

  const password = passArg ? String(passArg) : generatePassword();
  const hashed = await bcrypt.hash(password, 10);

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role: role as import("@prisma/client").$Enums.UserRole,
          name,
          password: hashed,
          ...(schoolId ? { schoolId } : {}),
        },
      });
      console.log("Updated user:", {
        id: updated.id,
        email: updated.email,
        role: updated.role,
      });
      console.log("Password (plain):", password);
      process.exit(0);
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role as import("@prisma/client").$Enums.UserRole,
        password: hashed,
        ...(schoolId ? { schoolId } : {}),
      },
    });

    console.log("Created user:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });
    console.log("Password (plain):", password);
    process.exit(0);
  } catch (err) {
    console.error("Error creating/updating user:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
