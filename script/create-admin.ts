#!/usr/bin/env -S tsx

/**
 * Script para crear/actualizar un usuario con rol admin / super_admin
 * Uso:
 *  npx tsx script/create-admin.ts --email=admin@example.com --name="Admin" --role=admin --password=secret
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
  const role = String(args.role || args.r || "admin").toLowerCase();
  const passArg = args.password || args.p;

  if (!email) {
    console.error("Error: --email is required");
    process.exit(2);
  }

  if (!["admin", "super_admin"].includes(role)) {
    console.error("Error: --role must be 'admin' or 'super_admin'");
    process.exit(2);
  }

  const password = passArg ? String(passArg) : generatePassword();
  const hashed = await bcrypt.hash(password, 10);

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const updated = await prisma.user.update({
        where: { email },
        data: {
          role,
          name,
          password: hashed,
        },
      });
      console.log("Updated user:", { id: updated.id, email: updated.email, role: updated.role });
      console.log("Password (plain):", password);
      process.exit(0);
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        password: hashed,
      },
    });

    console.log("Created user:", { id: user.id, email: user.email, role: user.role });
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
