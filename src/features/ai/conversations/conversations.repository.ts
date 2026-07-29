import { db } from "@/lib/db";
import type { AiModuleKey, AiMessageRole, AiProviderKey, Prisma } from "@/generated/prisma/client";

export interface StartConversationInput {
  userId?: string;
  guestSessionId?: string;
  module: AiModuleKey;
  language: string;
  title?: string;
}

export function createConversation(input: StartConversationInput) {
  return db.aiConversation.create({ data: input });
}

export function getConversationById(id: string) {
  return db.aiConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      uploadedFiles: { orderBy: { createdAt: "asc" } },
    },
  });
}

/** Ownership check — a guest may only touch conversations tied to their own cookie session, same for a user. */
export function conversationBelongsTo(
  conversation: { userId: string | null; guestSessionId: string | null },
  identity: { userId?: string; guestSessionId?: string }
): boolean {
  if (identity.userId) return conversation.userId === identity.userId;
  if (identity.guestSessionId) return conversation.guestSessionId === identity.guestSessionId;
  return false;
}

export function listConversationsForIdentity(identity: { userId?: string; guestSessionId?: string }, module?: AiModuleKey) {
  const where: Prisma.AiConversationWhereInput = identity.userId
    ? { userId: identity.userId, archivedAt: null, ...(module && { module }) }
    : { guestSessionId: identity.guestSessionId, archivedAt: null, ...(module && { module }) };

  return db.aiConversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: { id: true, module: true, title: true, language: true, createdAt: true, updatedAt: true },
  });
}

export function appendMessage(input: {
  conversationId: string;
  role: AiMessageRole;
  content: string;
  attachments?: Prisma.InputJsonValue;
  providerKey?: AiProviderKey;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
}) {
  return db.$transaction([
    db.aiMessage.create({ data: input }),
    db.aiConversation.update({ where: { id: input.conversationId }, data: { updatedAt: new Date() } }),
  ]);
}

export function setConversationTitle(id: string, title: string) {
  return db.aiConversation.update({ where: { id }, data: { title } });
}

export function archiveConversation(id: string) {
  return db.aiConversation.update({ where: { id }, data: { archivedAt: new Date() } });
}

export function deleteConversation(id: string) {
  return db.aiConversation.delete({ where: { id } });
}

export function countMessagesInConversation(conversationId: string) {
  return db.aiMessage.count({ where: { conversationId } });
}

/** Admin observability — overall conversation volume and how it splits across modules and guest/registered identity. */
export async function getConversationStats() {
  const [total, active, guestCount, userCount, byModule] = await Promise.all([
    db.aiConversation.count(),
    db.aiConversation.count({ where: { archivedAt: null } }),
    db.aiConversation.count({ where: { guestSessionId: { not: null } } }),
    db.aiConversation.count({ where: { userId: { not: null } } }),
    db.aiConversation.groupBy({ by: ["module"], _count: { _all: true } }),
  ]);

  return {
    total,
    active,
    guestCount,
    userCount,
    byModule: byModule.map((row) => ({ module: row.module, count: row._count._all })),
  };
}
