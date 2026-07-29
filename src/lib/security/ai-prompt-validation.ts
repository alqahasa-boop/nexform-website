import { AI_LIMITS } from "@/config/ai.config";

export interface PromptValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Best-effort prompt-injection heuristics — NOT a complete defense (no regex
 * list can be). Its job is to catch the common, low-effort override attempts
 * ("ignore your instructions", "reveal your system prompt") before they reach
 * the model, as one layer alongside the system prompt itself refusing to
 * comply with such requests. Logged, not silently dropped, so patterns can be
 * reviewed and expanded from real traffic in the admin AI panel.
 */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+instructions/i,
  /disregard\s+(your|the)\s+(system\s+)?(prompt|instructions|rules)/i,
  /reveal\s+(your|the)\s+system\s+prompt/i,
  /you\s+are\s+now\s+(DAN|in\s+developer\s+mode|unrestricted)/i,
  /pretend\s+you\s+have\s+no\s+(rules|restrictions|guidelines)/i,
  /act\s+as\s+if\s+you\s+have\s+no\s+content\s+polic/i,
];

export function validateChatPrompt(content: string): PromptValidationResult {
  const trimmed = content.trim();

  if (!trimmed) return { valid: false, error: "Message cannot be empty." };
  if (trimmed.length > AI_LIMITS.maxChatMessageLength) {
    return { valid: false, error: `Message is too long (max ${AI_LIMITS.maxChatMessageLength} characters).` };
  }

  return { valid: true };
}

export function looksLikePromptInjection(content: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(content));
}

export function validateSearchQuery(query: string): PromptValidationResult {
  const trimmed = query.trim();
  if (!trimmed) return { valid: false, error: "Search query cannot be empty." };
  if (trimmed.length > 500) return { valid: false, error: "Search query is too long." };
  return { valid: true };
}
