import { db } from "@/lib/db";
import type { SetSettingInput, SettingGroup } from "./types";

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const row = await db.setting.findUnique({ where: { key } });
  return (row?.value as T) ?? null;
}

export function listSettingsByGroup(group: SettingGroup) {
  return db.setting.findMany({ where: { group } });
}

export function setSetting(input: SetSettingInput) {
  return db.setting.upsert({
    where: { key: input.key },
    create: { key: input.key, value: input.value as never, group: input.group },
    update: { value: input.value as never, group: input.group },
  });
}

export function deleteSetting(key: string) {
  return db.setting.delete({ where: { key } });
}
