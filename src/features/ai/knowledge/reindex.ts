import { db } from "@/lib/db";
import { runEmbeddingTask } from "@/lib/ai/orchestrator";
import { isAiConfigured } from "@/lib/ai/provider-registry";
import {
  upsertKnowledgeChunk,
  deleteChunksForEntity,
  setChunkEmbedding,
  listUnembeddedChunks,
  clearAllChunks,
  type KnowledgeEntityType,
} from "./knowledge.repository";

const CHUNK_SIZE = 1200;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text: string, size = CHUNK_SIZE): string[] {
  const clean = text.trim();
  if (!clean) return [];
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size) chunks.push(clean.slice(i, i + size));
  return chunks;
}

async function indexEntity(entityType: KnowledgeEntityType, entityId: string, language: string, text: string): Promise<number> {
  await deleteChunksForEntity(entityType, entityId);
  const chunks = chunkText(text);
  for (let i = 0; i < chunks.length; i++) {
    await upsertKnowledgeChunk({ entityType, entityId, language, chunkIndex: i, content: chunks[i]! });
  }
  return chunks.length;
}

async function reindexContent(): Promise<number> {
  const rows = await db.content.findMany({ where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } });
  let total = 0;
  for (const row of rows) {
    const text = [row.title, row.excerpt, stripHtml(row.body)].filter(Boolean).join("\n\n");
    total += await indexEntity("Content", row.id, row.language, text);
  }
  return total;
}

async function reindexProjects(): Promise<number> {
  const rows = await db.project.findMany({ where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } });
  let total = 0;
  for (const row of rows) {
    const text = [row.title, row.summary, row.description && stripHtml(row.description), row.location, row.projectType]
      .filter(Boolean)
      .join("\n\n");
    total += await indexEntity("Project", row.id, row.language, text);
  }
  return total;
}

async function reindexServices(): Promise<number> {
  const rows = await db.service.findMany({ where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } });
  let total = 0;
  for (const row of rows) {
    const text = [row.title, row.description && stripHtml(row.description), row.features.join(", ")].filter(Boolean).join("\n\n");
    total += await indexEntity("Service", row.id, row.language, text);
  }
  return total;
}

async function reindexFaq(): Promise<number> {
  const rows = await db.faqItem.findMany({ where: { isPublished: true, deletedAt: null } });
  let total = 0;
  for (const row of rows) {
    const text = `${row.question}\n\n${row.answer}`;
    total += await indexEntity("FaqItem", row.id, row.language, text);
  }
  return total;
}

async function reindexConstructionLibrary(): Promise<number> {
  const rows = await db.constructionLibraryItem.findMany({ where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } });
  let total = 0;
  for (const row of rows) {
    const text = [row.title, row.description].filter(Boolean).join("\n\n");
    total += await indexEntity("ConstructionLibraryItem", row.id, row.language, text);
  }
  return total;
}

async function reindexConstructionJourney(): Promise<number> {
  const rows = await db.constructionJourneyStage.findMany({ where: { status: "PUBLISHED", visibility: "PUBLIC", deletedAt: null } });
  let total = 0;
  for (const row of rows) {
    const text = [row.title, row.richContent && stripHtml(row.richContent)].filter(Boolean).join("\n\n");
    total += await indexEntity("ConstructionJourneyStage", row.id, row.language, text);
  }
  return total;
}

async function reindexCompanies(): Promise<number> {
  const rows = await db.company.findMany({ where: { approvalStatus: "APPROVED", isActive: true, deletedAt: null } });
  let total = 0;
  for (const row of rows) {
    const text = [row.name, row.description].filter(Boolean).join("\n\n");
    // Company isn't a row-per-locale model — indexed once under "en" (see schema-level note).
    total += await indexEntity("Company", row.id, "en", text);
  }
  return total;
}

export interface ReindexResult {
  totalChunks: number;
  byType: Record<string, number>;
  embeddingsGenerated: number;
  embeddingSkippedReason?: string;
}

/**
 * Admin-triggered, not automatic-on-every-publish — see the Phase 6A
 * completion report for why. Safe to run repeatedly: each entity's chunks
 * are fully replaced (deleted then rewritten), never appended to.
 */
export async function reindexAll(): Promise<ReindexResult> {
  const byType: Record<string, number> = {
    Content: await reindexContent(),
    Project: await reindexProjects(),
    Service: await reindexServices(),
    FaqItem: await reindexFaq(),
    ConstructionLibraryItem: await reindexConstructionLibrary(),
    ConstructionJourneyStage: await reindexConstructionJourney(),
    Company: await reindexCompanies(),
  };

  let embeddingsGenerated = 0;
  let embeddingSkippedReason: string | undefined;

  if (isAiConfigured()) {
    try {
      let batch = await listUnembeddedChunks(50);
      while (batch.length > 0) {
        const { embeddings, model } = await runEmbeddingTask({ texts: batch.map((c) => c.content) });
        await Promise.all(batch.map((chunk, i) => setChunkEmbedding(chunk.id, embeddings[i]!, model)));
        embeddingsGenerated += batch.length;
        batch = await listUnembeddedChunks(50);
      }
    } catch (error) {
      embeddingSkippedReason = error instanceof Error ? error.message : "Embedding generation failed.";
    }
  } else {
    embeddingSkippedReason =
      "No AI provider configured — content was indexed as plain text and keyword search works now; semantic search activates automatically once a provider is configured.";
  }

  const totalChunks = Object.values(byType).reduce((a, b) => a + b, 0);
  return { totalChunks, byType, embeddingsGenerated, embeddingSkippedReason };
}

export async function clearKnowledgeIndex(): Promise<void> {
  await clearAllChunks();
}
