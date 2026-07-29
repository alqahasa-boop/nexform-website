import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { AI_KNOWLEDGE_ENTITY_TYPES } from "@/config/ai.config";

export type KnowledgeEntityType = (typeof AI_KNOWLEDGE_ENTITY_TYPES)[number];

export interface KnowledgeChunkInput {
  entityType: KnowledgeEntityType;
  entityId: string;
  language: string;
  chunkIndex: number;
  content: string;
  embedding?: number[];
  embeddingModel?: string;
}

export function upsertKnowledgeChunk(input: KnowledgeChunkInput) {
  const { entityType, entityId, language, chunkIndex, ...rest } = input;
  return db.aiKnowledgeChunk.upsert({
    where: { entityType_entityId_language_chunkIndex: { entityType, entityId, language, chunkIndex } },
    create: { entityType, entityId, language, chunkIndex, ...rest },
    update: { ...rest },
  });
}

export function deleteChunksForEntity(entityType: KnowledgeEntityType, entityId: string) {
  return db.aiKnowledgeChunk.deleteMany({ where: { entityType, entityId } });
}

export function countIndexedChunks() {
  return db.aiKnowledgeChunk.count();
}

export function countIndexedChunksByType() {
  return db.aiKnowledgeChunk.groupBy({ by: ["entityType"], _count: { _all: true } });
}

export function getLastIndexedAt() {
  return db.aiKnowledgeChunk.findFirst({ orderBy: { indexedAt: "desc" }, select: { indexedAt: true } });
}

export function clearAllChunks() {
  return db.aiKnowledgeChunk.deleteMany({});
}

/** Chunks that have text but no embedding yet — e.g. indexed while no provider was configured. */
export function listUnembeddedChunks(limit = 200) {
  return db.aiKnowledgeChunk.findMany({
    where: { embedding: { equals: Prisma.DbNull } },
    take: limit,
  });
}

export function setChunkEmbedding(id: string, embedding: number[], embeddingModel: string) {
  return db.aiKnowledgeChunk.update({ where: { id }, data: { embedding, embeddingModel } });
}

/** Plain-text fallback search — works with zero AI configuration, always available. */
/**
 * Natural-language queries rarely appear as a literal substring of the
 * indexed text ("villa permits" vs "...permits ... for a villa build...").
 * Falling back to per-word matching (any significant word, not the whole
 * phrase) makes the no-embeddings keyword path actually useful instead of
 * only matching queries that happen to be an exact quote.
 */
export function keywordSearchChunks(query: string, language: string, limit = 8) {
  const terms = Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ""))
        .filter((w) => w.length >= 3)
    )
  );

  if (terms.length === 0) {
    return db.aiKnowledgeChunk.findMany({
      where: { language, content: { contains: query, mode: "insensitive" } },
      take: limit,
    });
  }

  return db.aiKnowledgeChunk.findMany({
    where: { language, OR: terms.map((term) => ({ content: { contains: term, mode: "insensitive" } })) },
    take: limit,
  });
}

export function listChunksWithEmbeddings(language: string) {
  return db.aiKnowledgeChunk.findMany({
    where: { language, embedding: { not: Prisma.DbNull } },
  });
}
