import type { AiModuleKey } from "@/generated/prisma/client";
import { resolveProviderForCapability, isAiConfigured, listConfiguredProviderKeys } from "./provider-registry";
import { recordPromptLog } from "@/features/ai/logs/ai-logs.repository";
import { buildSystemPrompt } from "./prompts";
import { AiProviderError, AiNotConfiguredError } from "./types";
import type { AiChatMessage, AiChatResult, AiEmbeddingResult, AiProviderKeyLiteral } from "./types";

export interface OrchestratorContext {
  userId?: string;
  guestSessionId?: string;
}

/**
 * The one intelligent controller every AI feature goes through. It picks the
 * right provider for the task's required capability (chat/vision/embedding),
 * injects the module's grounded system prompt, and logs every call — success
 * or failure — to `AiPromptLog` for the admin observability panel. Callers
 * never talk to a provider SDK directly.
 */
export async function runChatTask(input: {
  module: AiModuleKey;
  messages: AiChatMessage[];
  language: string;
  knowledgeContext?: string;
  context: OrchestratorContext;
}): Promise<AiChatResult> {
  const startedAt = Date.now();
  const systemPrompt = buildSystemPrompt(input.module, input.language, input.knowledgeContext);
  const messagesWithSystem: AiChatMessage[] = [{ role: "system", content: systemPrompt }, ...input.messages];
  const lastUserMessage = [...input.messages].reverse().find((m) => m.role === "user")?.content ?? "";

  try {
    const provider = resolveProviderForCapability("chat");
    const result = await provider.chat({ messages: messagesWithSystem });

    await recordPromptLog({
      userId: input.context.userId,
      guestSessionId: input.context.guestSessionId,
      module: input.module,
      providerKey: result.providerKey,
      model: result.model,
      promptPreview: lastUserMessage.slice(0, 300),
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      latencyMs: Date.now() - startedAt,
      success: true,
    });

    return result;
  } catch (error) {
    await recordPromptLog({
      userId: input.context.userId,
      guestSessionId: input.context.guestSessionId,
      module: input.module,
      promptPreview: lastUserMessage.slice(0, 300),
      latencyMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown AI error.",
      providerKey: error instanceof AiProviderError ? error.providerKey : undefined,
    });
    throw error;
  }
}

export async function runVisionTask(input: {
  module: AiModuleKey;
  imageUrl: string;
  prompt: string;
  language: string;
  context: OrchestratorContext;
}): Promise<AiChatResult> {
  const startedAt = Date.now();
  const fullPrompt = `${buildSystemPrompt(input.module, input.language)}\n\n${input.prompt}`;

  try {
    const provider = resolveProviderForCapability("vision");
    const result = await provider.analyzeImage({ imageUrl: input.imageUrl, prompt: fullPrompt });

    await recordPromptLog({
      userId: input.context.userId,
      guestSessionId: input.context.guestSessionId,
      module: input.module,
      providerKey: result.providerKey,
      model: result.model,
      promptPreview: input.prompt.slice(0, 300),
      tokensIn: result.tokensIn,
      tokensOut: result.tokensOut,
      latencyMs: Date.now() - startedAt,
      success: true,
    });

    return result;
  } catch (error) {
    await recordPromptLog({
      userId: input.context.userId,
      guestSessionId: input.context.guestSessionId,
      module: input.module,
      promptPreview: input.prompt.slice(0, 300),
      latencyMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown AI error.",
      providerKey: error instanceof AiProviderError ? error.providerKey : undefined,
    });
    throw error;
  }
}

export async function runEmbeddingTask(input: { texts: string[]; context?: OrchestratorContext }): Promise<AiEmbeddingResult> {
  const startedAt = Date.now();
  try {
    const provider = resolveProviderForCapability("embedding");
    const result = await provider.embed({ texts: input.texts });

    await recordPromptLog({
      userId: input.context?.userId,
      guestSessionId: input.context?.guestSessionId,
      module: "KNOWLEDGE_SEARCH",
      providerKey: result.providerKey,
      model: result.model,
      promptPreview: `[embedding] ${input.texts.length} text(s)`,
      latencyMs: Date.now() - startedAt,
      success: true,
    });

    return result;
  } catch (error) {
    await recordPromptLog({
      userId: input.context?.userId,
      guestSessionId: input.context?.guestSessionId,
      module: "KNOWLEDGE_SEARCH",
      promptPreview: `[embedding] ${input.texts.length} text(s)`,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorMessage: error instanceof Error ? error.message : "Unknown AI error.",
      providerKey: error instanceof AiProviderError ? error.providerKey : undefined,
    });
    throw error;
  }
}

export function getConfiguredProviderSummary(): { configured: boolean; providers: AiProviderKeyLiteral[] } {
  return { configured: isAiConfigured(), providers: listConfiguredProviderKeys() };
}

export { AiNotConfiguredError, AiProviderError };
