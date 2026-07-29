import { db } from "@/lib/db";
import { AiModuleKey, type Prisma } from "@/generated/prisma/client";

const AI_MODULE_LIST = Object.values(AiModuleKey);

export function listModuleSettings() {
  return db.aiModuleSetting.findMany();
}

/** Modules with no row yet are treated as enabled — a fresh install shouldn't require seeding rows to work. */
export async function getEnabledModules(): Promise<AiModuleKey[]> {
  const rows = await db.aiModuleSetting.findMany();
  const disabled = new Set(rows.filter((r) => !r.isEnabled).map((r) => r.module));
  return AI_MODULE_LIST.filter((m) => !disabled.has(m));
}

export async function isModuleEnabled(module: AiModuleKey): Promise<boolean> {
  const row = await db.aiModuleSetting.findUnique({ where: { module } });
  return row?.isEnabled ?? true;
}

export function setModuleEnabled(module: AiModuleKey, isEnabled: boolean, config?: Prisma.InputJsonValue) {
  return db.aiModuleSetting.upsert({
    where: { module },
    create: { module, isEnabled, ...(config !== undefined && { config }) },
    update: { isEnabled, ...(config !== undefined && { config }) },
  });
}
