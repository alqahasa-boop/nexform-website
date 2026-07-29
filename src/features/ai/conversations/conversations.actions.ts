"use server";

import { revalidatePath } from "next/cache";
import type { AiModuleKey } from "@/generated/prisma/client";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getOrCreateGuestSessionId, getGuestSessionId } from "@/lib/ai/guest-session";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { validateChatPrompt, looksLikePromptInjection } from "@/lib/security/ai-prompt-validation";
import { AI_LIMITS } from "@/config/ai.config";
import { runChatTask } from "@/lib/ai/orchestrator";
import { isAiConfigured } from "@/lib/ai/provider-registry";
import { AiProviderError } from "@/lib/ai/types";
import type { AiChatMessage } from "@/lib/ai/types";
import { findRelevantKnowledge, formatKnowledgeContext } from "@/features/ai/knowledge/knowledge-retrieval";
import { isModuleEnabled } from "@/features/ai/settings/settings.repository";
import {
  createConversation,
  getConversationById,
  conversationBelongsTo,
  listConversationsForIdentity,
  appendMessage,
  archiveConversation,
  deleteConversation,
  countMessagesInConversation,
} from "./conversations.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

const GROUNDED_MODULES: AiModuleKey[] = ["CONSTRUCTION_ADVISOR", "BUILD_JOURNEY_ASSISTANT", "KNOWLEDGE_SEARCH"];

async function resolveIdentity() {
  const session = await getAdminSession();
  if (session) return { userId: session.id, guestSessionId: undefined };
  return { userId: undefined, guestSessionId: await getOrCreateGuestSessionId() };
}

export interface SendChatMessageInput {
  conversationId?: string;
  module: AiModuleKey;
  content: string;
  language: string;
}

export interface SendChatMessageResult {
  conversationId: string;
  reply: string | null;
  status: "ok" | "not_configured";
}

export async function sendChatMessageAction(input: SendChatMessageInput): Promise<ApiResult<SendChatMessageResult>> {
  if (!(await isModuleEnabled(input.module))) {
    return apiError("This assistant is temporarily unavailable — please try again later.", "MODULE_DISABLED");
  }

  const identity = await resolveIdentity();

  const rateKey = identity.userId ? `ai-chat:user:${identity.userId}` : `ai-chat:guest:${identity.guestSessionId}`;
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.aiChat });
  if (!allowed) return apiError("You're sending messages too quickly — please wait a moment and try again.", "RATE_LIMITED");

  const validation = validateChatPrompt(input.content);
  if (!validation.valid) return apiError(validation.error ?? "Invalid message.", "VALIDATION");

  if (looksLikePromptInjection(input.content)) {
    return apiError(
      "That message looks like it's trying to override the assistant's instructions, which isn't allowed here.",
      "PROMPT_REJECTED"
    );
  }

  let conversationId = input.conversationId;
  if (conversationId) {
    const existing = await getConversationById(conversationId);
    if (!existing || !conversationBelongsTo(existing, identity)) {
      return apiError("Conversation not found.", "NOT_FOUND");
    }
  } else {
    const created = await createConversation({ ...identity, module: input.module, language: input.language });
    conversationId = created.id;
  }

  const messageCount = await countMessagesInConversation(conversationId);
  if (messageCount >= AI_LIMITS.maxConversationMessages) {
    return apiError("This conversation has reached its message limit — please start a new one.", "CONVERSATION_LIMIT");
  }

  await appendMessage({ conversationId, role: "USER", content: input.content });

  if (!isAiConfigured()) {
    return apiSuccess({ conversationId, reply: null, status: "not_configured" });
  }

  const conversation = await getConversationById(conversationId);
  const history: AiChatMessage[] = (conversation?.messages ?? []).slice(-20).map((m) => ({
    role: m.role.toLowerCase() as "user" | "assistant" | "system",
    content: m.content,
  }));

  let knowledgeContext: string | undefined;
  if (GROUNDED_MODULES.includes(input.module)) {
    const matches = await findRelevantKnowledge(input.content, input.language);
    knowledgeContext = formatKnowledgeContext(matches);
  }

  try {
    const result = await runChatTask({
      module: input.module,
      messages: history,
      language: input.language,
      knowledgeContext,
      context: identity,
    });

    await appendMessage({
      conversationId,
      role: "ASSISTANT",
      content: result.content,
      providerKey: result.providerKey,
      model: result.model,
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
    });

    return apiSuccess({ conversationId, reply: result.content, status: "ok" });
  } catch (error) {
    if (error instanceof AiProviderError) {
      return apiError("The AI provider returned an error — please try again in a moment.", "PROVIDER_ERROR");
    }
    return apiSuccess({ conversationId, reply: null, status: "not_configured" });
  }
}

export async function getConversationAction(conversationId: string): Promise<ApiResult<NonNullable<Awaited<ReturnType<typeof getConversationById>>>>> {
  const identity = await resolveIdentity();
  const conversation = await getConversationById(conversationId);
  if (!conversation || !conversationBelongsTo(conversation, identity)) {
    return apiError("Conversation not found.", "NOT_FOUND");
  }
  return apiSuccess(conversation);
}

export async function listMyConversationsAction(module?: AiModuleKey): Promise<ApiResult<Awaited<ReturnType<typeof listConversationsForIdentity>>>> {
  const session = await getAdminSession();
  const guestSessionId = session ? undefined : await getGuestSessionId();
  if (!session && !guestSessionId) return apiSuccess([]);

  const conversations = await listConversationsForIdentity({ userId: session?.id, guestSessionId: guestSessionId ?? undefined }, module);
  return apiSuccess(conversations);
}

export async function archiveConversationAction(conversationId: string): Promise<ApiResult<null>> {
  const identity = await resolveIdentity();
  const conversation = await getConversationById(conversationId);
  if (!conversation || !conversationBelongsTo(conversation, identity)) {
    return apiError("Conversation not found.", "NOT_FOUND");
  }
  await archiveConversation(conversationId);
  revalidatePath("/account/assistant");
  return apiSuccess(null);
}

export async function deleteConversationAction(conversationId: string): Promise<ApiResult<null>> {
  const identity = await resolveIdentity();
  const conversation = await getConversationById(conversationId);
  if (!conversation || !conversationBelongsTo(conversation, identity)) {
    return apiError("Conversation not found.", "NOT_FOUND");
  }
  await deleteConversation(conversationId);
  revalidatePath("/account/assistant");
  return apiSuccess(null);
}
