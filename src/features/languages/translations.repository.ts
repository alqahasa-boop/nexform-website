import { db } from "@/lib/db";

export interface TranslationRef {
  entityType: string;
  entityId: string;
  locale: string;
}

/** Fetches every translated field for one entity/locale as a flat `{ field: value }` map. */
export async function getTranslations({ entityType, entityId, locale }: TranslationRef): Promise<Record<string, string>> {
  const rows = await db.translation.findMany({ where: { entityType, entityId, locale } });
  return Object.fromEntries(rows.map((row) => [row.field, row.value]));
}

export function setTranslation(ref: TranslationRef & { field: string; value: string }) {
  return db.translation.upsert({
    where: {
      entityType_entityId_locale_field: {
        entityType: ref.entityType,
        entityId: ref.entityId,
        locale: ref.locale,
        field: ref.field,
      },
    },
    create: ref,
    update: { value: ref.value },
  });
}

export function deleteEntityTranslations(entityType: string, entityId: string) {
  return db.translation.deleteMany({ where: { entityType, entityId } });
}
