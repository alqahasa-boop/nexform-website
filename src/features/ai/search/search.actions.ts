"use server";

import { db } from "@/lib/db";
import { getAdminSession, assertPermission, ForbiddenError } from "@/lib/auth/admin-session";
import { getGuestSessionId } from "@/lib/ai/guest-session";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { validateSearchQuery } from "@/lib/security/ai-prompt-validation";
import { findRelevantKnowledge } from "@/features/ai/knowledge/knowledge-retrieval";
import { hashQuery, getCachedSearch, cacheSearchResults, clearSearchCache } from "./search.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export interface AiSearchResultItem {
  entityType: string;
  title: string;
  snippet: string;
  href: string;
  score: number;
}

/**
 * Public routes are list-only today (no per-item detail pages exist yet for
 * Projects/Services/Companies/Content on the public site — a pre-existing
 * gap outside this feature's scope, see the Phase 6A report) — so a match
 * links to the relevant listing page rather than a dead-end detail URL.
 */
const ENTITY_LIST_HREF: Record<string, string> = {
  Content: "/knowledge",
  Project: "/projects",
  Service: "/services",
  FaqItem: "/knowledge/faq",
  ConstructionLibraryItem: "/knowledge/library",
  ConstructionJourneyStage: "/knowledge/build-journey",
  Company: "/companies",
  DesignIdea: "/gallery",
};

async function resolveTitle(entityType: string, entityId: string): Promise<string | null> {
  switch (entityType) {
    case "Content": {
      const row = await db.content.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    case "Project": {
      const row = await db.project.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    case "Service": {
      const row = await db.service.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    case "FaqItem": {
      const row = await db.faqItem.findUnique({ where: { id: entityId }, select: { question: true } });
      return row?.question ?? null;
    }
    case "ConstructionLibraryItem": {
      const row = await db.constructionLibraryItem.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    case "ConstructionJourneyStage": {
      const row = await db.constructionJourneyStage.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    case "Company": {
      const row = await db.company.findUnique({ where: { id: entityId }, select: { name: true } });
      return row?.name ?? null;
    }
    case "DesignIdea": {
      const row = await db.designIdea.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    default:
      return null;
  }
}

export async function aiSearchAction(query: string, language: string): Promise<ApiResult<AiSearchResultItem[]>> {
  const session = await getAdminSession();
  const guestSessionId = session ? null : await getGuestSessionId();
  const rateKey = session ? `ai-search:user:${session.id}` : `ai-search:guest:${guestSessionId ?? "anon"}`;
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.aiSearch });
  if (!allowed) return apiError("Too many searches — please wait a moment and try again.", "RATE_LIMITED");

  const validation = validateSearchQuery(query);
  if (!validation.valid) return apiError(validation.error ?? "Invalid search query.", "VALIDATION");

  const queryHash = hashQuery(query, language);
  const cached = await getCachedSearch(queryHash);
  if (cached) return apiSuccess(cached as unknown as AiSearchResultItem[]);

  const matches = await findRelevantKnowledge(query, language, 10);

  const results: AiSearchResultItem[] = [];
  for (const match of matches) {
    const title = await resolveTitle(match.entityType, match.entityId);
    if (!title) continue;
    results.push({
      entityType: match.entityType,
      title,
      snippet: match.content.slice(0, 220),
      href: ENTITY_LIST_HREF[match.entityType] ?? "/",
      score: match.score,
    });
  }

  await cacheSearchResults(queryHash, query, language, JSON.parse(JSON.stringify(results)));
  return apiSuccess(results);
}

export async function clearSearchCacheAction(): Promise<ApiResult<null>> {
  try {
    await assertPermission("ai:manage");
    await clearSearchCache();
    return apiSuccess(null);
  } catch (error) {
    if (error instanceof ForbiddenError) return apiError(error.message, "FORBIDDEN");
    throw error;
  }
}
