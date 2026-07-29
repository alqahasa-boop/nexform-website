import { isAiConfigured, resolveProviderForCapability } from "@/lib/ai/provider-registry";
import { runEmbeddingTask } from "@/lib/ai/orchestrator";
import { keywordSearchChunks, listChunksWithEmbeddings } from "./knowledge.repository";

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface KnowledgeMatch {
  entityType: string;
  entityId: string;
  content: string;
  score: number;
}

/**
 * Semantic search when an embedding-capable provider is configured, a plain
 * keyword match otherwise — the knowledge engine degrades gracefully instead
 * of going dark the moment AI isn't configured. Either way, results only ever
 * come from NEXFORM's own indexed content, never from the model's imagination.
 */
export async function findRelevantKnowledge(query: string, language: string, limit = 6): Promise<KnowledgeMatch[]> {
  const canEmbed = isAiConfigured() && (() => {
    try {
      resolveProviderForCapability("embedding");
      return true;
    } catch {
      return false;
    }
  })();

  if (!canEmbed) {
    const chunks = await keywordSearchChunks(query, language, limit);
    return chunks.map((c) => ({ entityType: c.entityType, entityId: c.entityId, content: c.content, score: 1 }));
  }

  const [{ embeddings }, chunks] = await Promise.all([
    runEmbeddingTask({ texts: [query] }),
    listChunksWithEmbeddings(language),
  ]);
  const queryEmbedding = embeddings[0];
  if (!queryEmbedding || chunks.length === 0) {
    const fallback = await keywordSearchChunks(query, language, limit);
    return fallback.map((c) => ({ entityType: c.entityType, entityId: c.entityId, content: c.content, score: 1 }));
  }

  const scored = chunks
    .map((chunk) => ({
      entityType: chunk.entityType,
      entityId: chunk.entityId,
      content: chunk.content,
      score: cosineSimilarity(queryEmbedding, chunk.embedding as number[]),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

export function formatKnowledgeContext(matches: KnowledgeMatch[]): string | undefined {
  if (matches.length === 0) return undefined;
  return matches.map((m, i) => `[${i + 1}] (${m.entityType}) ${m.content}`).join("\n\n");
}
