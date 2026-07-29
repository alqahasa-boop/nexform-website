/**
 * The AI Gateway's provider-agnostic contract. Every feature (chat, document
 * analysis, image understanding, embeddings) codes against this interface —
 * never against `openai` or `@anthropic-ai/sdk` directly — so adding a third
 * provider, or dropping one, never touches feature code.
 */

export type AiProviderKeyLiteral = "OPENAI" | "ANTHROPIC";

export interface AiProviderCapabilities {
  chat: boolean;
  vision: boolean;
  embedding: boolean;
}

export interface AiChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AiChatOptions {
  messages: AiChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AiChatResult {
  content: string;
  model: string;
  providerKey: AiProviderKeyLiteral;
  tokensIn?: number;
  tokensOut?: number;
}

export interface AiChatChunk {
  delta: string;
  done: boolean;
}

export interface AiVisionOptions {
  imageUrl: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
}

export interface AiEmbeddingOptions {
  texts: string[];
  model?: string;
}

export interface AiEmbeddingResult {
  embeddings: number[][];
  model: string;
  providerKey: AiProviderKeyLiteral;
}

export interface AiProvider {
  readonly key: AiProviderKeyLiteral;
  readonly capabilities: AiProviderCapabilities;
  chat(options: AiChatOptions): Promise<AiChatResult>;
  chatStream(options: AiChatOptions): AsyncGenerator<AiChatChunk>;
  analyzeImage(options: AiVisionOptions): Promise<AiChatResult>;
  embed(options: AiEmbeddingOptions): Promise<AiEmbeddingResult>;
}

/** Thrown by every AI feature action when no provider is configured — never a silent failure. */
export class AiNotConfiguredError extends Error {
  constructor(message = "AI is not configured yet. An administrator needs to add a provider API key.") {
    super(message);
    this.name = "AiNotConfiguredError";
  }
}

/** Thrown when the configured provider's API call itself fails (network, auth, rate limit upstream, ...). */
export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly providerKey: AiProviderKeyLiteral,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}
