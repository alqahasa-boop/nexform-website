/**
 * One-time bootstrap for the first NEXFORM Super Admin account.
 *
 * Usage:
 *   SUPER_ADMIN_EMAIL="you@nexform.com" SUPER_ADMIN_PASSWORD="a-strong-password" npx tsx scripts/create-super-admin.ts
 *
 * Deliberately environment-variable driven rather than an interactive prompt — Node has
 * no built-in hidden stdin input, so an interactive prompt would echo the password to the
 * terminal/scrollback. Credentials are read from the process environment only, never
 * hardcoded, never logged, and never committed.
 *
 * Refuses to run if a Super Admin already exists — pass --force to add another anyway
 * (e.g. a second Super Admin for redundancy). This script never modifies an existing user.
 */
// This script runs directly via `tsx` (not through the Prisma CLI), so — unlike
// prisma.config.ts-driven commands — nothing loads .env for it automatically.
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

function isPasswordStrongEnough(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

// Deliberately simple — just enough to catch typos/malformed input, not full RFC 5322 validation.
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const force = process.argv.includes("--force");

  if (!email || !password) {
    console.error(
      "Missing SUPER_ADMIN_EMAIL and/or SUPER_ADMIN_PASSWORD environment variables.\n" +
        "Example:\n" +
        '  SUPER_ADMIN_EMAIL="you@nexform.com" SUPER_ADMIN_PASSWORD="a-strong-password" npx tsx scripts/create-super-admin.ts'
    );
    process.exitCode = 1;
    return;
  }

  if (!isValidEmail(email)) {
    console.error(`"${email}" does not look like a valid email address.`);
    process.exitCode = 1;
    return;
  }

  if (!isPasswordStrongEnough(password)) {
    console.error("Password must be at least 8 characters and include both a letter and a number.");
    process.exitCode = 1;
    return;
  }

  const superAdminRole = await db.role.findUnique({ where: { key: "SUPER_ADMIN" } });
  if (!superAdminRole) {
    console.error(
      'The "SUPER_ADMIN" role does not exist yet. Run `npx prisma db seed` first to seed system roles, then re-run this script.'
    );
    process.exitCode = 1;
    return;
  }

  if (!force) {
    const existingSuperAdminCount = await db.userRole.count({ where: { roleId: superAdminRole.id } });
    if (existingSuperAdminCount > 0) {
      console.error(
        `A Super Admin already exists (${existingSuperAdminCount} account(s)). ` +
          "Re-run with --force if you intentionally want to add another one."
      );
      process.exitCode = 1;
      return;
    }
  }

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    console.error(`A user with email "${email}" already exists. This script only creates new accounts.`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, isActive: true, emailVerified: new Date() },
    });
    await tx.userRole.create({ data: { userId: created.id, roleId: superAdminRole.id } });
    await tx.activityLog.create({
      data: {
        action: "CREATE",
        entityType: "User",
        entityId: created.id,
        metadata: { bootstrap: "create-super-admin-script" },
      },
    });
    return created;
  });

  console.log(`Super Admin created: ${user.email} (id: ${user.id})`);
  console.log("You can now sign in at /admin/login.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
