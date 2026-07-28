import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export interface SeoMetaInput {
  entityType: string;
  entityId: string;
  title?: string;
  description?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  robots?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

export function getSeoMeta(entityType: string, entityId: string) {
  return db.seoMeta.findUnique({ where: { entityType_entityId: { entityType, entityId } } });
}

export function setSeoMeta(input: SeoMetaInput) {
  const { entityType, entityId, structuredData, ...fields } = input;
  const jsonField = structuredData ? { structuredData: structuredData as Prisma.InputJsonValue } : {};

  return db.seoMeta.upsert({
    where: { entityType_entityId: { entityType, entityId } },
    create: { entityType, entityId, ...fields, ...jsonField },
    update: { ...fields, ...jsonField },
  });
}
