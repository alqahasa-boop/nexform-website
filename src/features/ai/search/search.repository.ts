import { createHash } from "crypto";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export function hashQuery(query: string, language: string): string {
  return createHash("sha256").update(`${language}:${query.trim().toLowerCase()}`).digest("hex");
}

export async function getCachedSearch(queryHash: string) {
  const cached = await db.aiSearchCache.findUnique({ where: { queryHash } });
  if (!cached || cached.expiresAt < new Date()) return null;
  return cached.resultsJson;
}

export function cacheSearchResults(queryHash: string, query: string, language: string, results: Prisma.InputJsonValue, ttlMs = 10 * 60 * 1000) {
  return db.aiSearchCache.upsert({
    where: { queryHash },
    create: { queryHash, query, language, resultsJson: results, expiresAt: new Date(Date.now() + ttlMs) },
    update: { resultsJson: results, expiresAt: new Date(Date.now() + ttlMs) },
  });
}

export function clearSearchCache() {
  return db.aiSearchCache.deleteMany({});
}
