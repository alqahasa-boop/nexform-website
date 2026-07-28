import { db } from "@/lib/db";

export function listLanguages(activeOnly = true) {
  return db.language.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export function getDefaultLanguage() {
  return db.language.findFirst({ where: { isDefault: true } });
}

export async function setDefaultLanguage(code: string) {
  return db.$transaction([
    db.language.updateMany({ data: { isDefault: false }, where: { isDefault: true } }),
    db.language.update({ where: { code }, data: { isDefault: true } }),
  ]);
}

export function setLanguageActive(code: string, isActive: boolean) {
  return db.language.update({ where: { code }, data: { isActive } });
}
