/**
 * Seeds SYSTEM configuration only: roles, permissions, role→permission
 * grants, and supported languages. This is reference data the app depends on
 * to function (there is no "no role" state), not demo content — no users,
 * articles, projects, or any other content row is created here.
 *
 * Run with: `npx prisma db seed`
 */
import { PrismaClient, SystemRoleKey } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  DEFAULT_ROLE_PERMISSIONS,
  MODULE_PERMISSIONS,
  PERMISSION_MODULES,
} from "../src/config/permissions.config";
import { SUPPORTED_LANGUAGES } from "../src/config/languages.config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const ROLE_DEFINITIONS: Record<SystemRoleKey, string> = {
  GUEST: "Unauthenticated visitor with public, read-only access.",
  CUSTOMER: "Registered visitor who can submit and track design requests.",
  EDITOR: "Manages articles, FAQ, and construction content.",
  DESIGN_MANAGER: "Manages projects, design ideas, and design requests.",
  ADVERTISING_MANAGER: "Manages advertisements, placements, and partner companies.",
  ANALYST: "Read-only access to analytics and activity logs.",
  ADMIN: "Full operational access across every module.",
  SUPER_ADMIN: "Unrestricted access, including role and permission management.",
};

async function seedPermissions() {
  const keys = PERMISSION_MODULES.flatMap((mod) =>
    MODULE_PERMISSIONS[mod].map((action) => ({ key: `${mod}:${action}`, module: mod }))
  );

  for (const { key, module } of keys) {
    await db.permission.upsert({ where: { key }, create: { key, module }, update: { module } });
  }

  console.log(`Seeded ${keys.length} permissions.`);
}

async function seedRoles() {
  for (const key of Object.values(SystemRoleKey)) {
    const role = await db.role.upsert({
      where: { key },
      create: { key, name: toTitleCase(key), description: ROLE_DEFINITIONS[key], isSystem: true },
      update: { description: ROLE_DEFINITIONS[key] },
    });

    if (key === "SUPER_ADMIN") continue; // Super Admin bypasses the table — see hasPermission().

    const permissionKeys = DEFAULT_ROLE_PERMISSIONS[key] ?? [];
    const permissions = await db.permission.findMany({ where: { key: { in: permissionKeys } } });

    await db.rolePermission.deleteMany({ where: { roleId: role.id } });
    if (permissions.length > 0) {
      await db.rolePermission.createMany({
        data: permissions.map((permission) => ({ roleId: role.id, permissionId: permission.id })),
        skipDuplicates: true,
      });
    }
  }

  console.log(`Seeded ${Object.values(SystemRoleKey).length} system roles.`);
}

async function seedLanguages() {
  for (const language of SUPPORTED_LANGUAGES) {
    await db.language.upsert({
      where: { code: language.code },
      create: { ...language, isActive: true },
      update: { ...language },
    });
  }

  console.log(`Seeded ${SUPPORTED_LANGUAGES.length} languages.`);
}

function toTitleCase(key: string) {
  return key
    .toLowerCase()
    .split("_")
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedLanguages();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
