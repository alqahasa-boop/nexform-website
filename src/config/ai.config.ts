/**
 * AI model selection — every model ID is env-overridable so a future model
 * release never requires a code change, only an env var update. Defaults
 * below are reasonable as of this writing but are not load-bearing; the
 * point of the AI Gateway is that nothing else in the codebase cares which
 * exact model string is in play.
 */
export const AI_MODELS = {
  openai: {
    chat: process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini",
    vision: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
    embedding: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  },
  anthropic: {
    chat: process.env.ANTHROPIC_CHAT_MODEL || "claude-3-5-sonnet-latest",
    vision: process.env.ANTHROPIC_VISION_MODEL || "claude-3-5-sonnet-latest",
  },
} as const;

/** Which provider the registry prefers when more than one is configured. Override with AI_PRIMARY_PROVIDER. */
export const AI_PRIMARY_PROVIDER = (process.env.AI_PRIMARY_PROVIDER || "OPENAI").toUpperCase();

export const AI_LIMITS = {
  maxChatMessageLength: 4000,
  maxConversationMessages: 60,
  maxDocumentTextChars: 60_000, // ~15k tokens of extracted text sent to the model per request
  maxUploadedFilesPerConversation: 10,
  chatMaxTokens: 1024,
  visionMaxTokens: 1024,
} as const;

export const AI_KNOWLEDGE_ENTITY_TYPES = [
  "Content",
  "Project",
  "Service",
  "FaqItem",
  "ConstructionLibraryItem",
  "ConstructionJourneyStage",
  "Company",
  "DesignIdea",
] as const;
