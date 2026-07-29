import { AI_PRIMARY_PROVIDER } from "@/config/ai.config";
import { createOpenAiProvider } from "./providers/openai.provider";
import { createAnthropicProvider } from "./providers/anthropic.provider";
import { AiNotConfiguredError, type AiProvider, type AiProviderKeyLiteral } from "./types";

let cachedProviders: Partial<Record<AiProviderKeyLiteral, AiProvider>> | null = null;

function buildProviders(): Partial<Record<AiProviderKeyLiteral, AiProvider>> {
  const providers: Partial<Record<AiProviderKeyLiteral, AiProvider>> = {};
  if (process.env.OPENAI_API_KEY) providers.OPENAI = createOpenAiProvider(process.env.OPENAI_API_KEY);
  if (process.env.ANTHROPIC_API_KEY) providers.ANTHROPIC = createAnthropicProvider(process.env.ANTHROPIC_API_KEY);
  return providers;
}

function getProviders(): Partial<Record<AiProviderKeyLiteral, AiProvider>> {
  if (!cachedProviders) cachedProviders = buildProviders();
  return cachedProviders;
}

/** Test-only escape hatch — clears the module-level cache so env var changes take effect without a restart. */
export function resetProviderCache() {
  cachedProviders = null;
}

export function isAiConfigured(): boolean {
  return Object.keys(getProviders()).length > 0;
}

export function listConfiguredProviderKeys(): AiProviderKeyLiteral[] {
  return Object.keys(getProviders()) as AiProviderKeyLiteral[];
}

/**
 * Resolves the provider to use for a request. Honors `AI_PRIMARY_PROVIDER` /
 * the caller's preference first, then falls back to whichever provider is
 * actually configured — so a request for a provider-specific capability
 * (e.g. embeddings, which Anthropic doesn't offer) still works if the other
 * configured provider supports it.
 */
export function resolveProvider(preferred?: AiProviderKeyLiteral): AiProvider {
  const providers = getProviders();
  const order: AiProviderKeyLiteral[] = preferred
    ? [preferred, ...(["OPENAI", "ANTHROPIC"] as const).filter((k) => k !== preferred)]
    : [AI_PRIMARY_PROVIDER as AiProviderKeyLiteral, ...(["OPENAI", "ANTHROPIC"] as const)];

  for (const key of order) {
    const provider = providers[key];
    if (provider) return provider;
  }

  throw new AiNotConfiguredError();
}

/** Like `resolveProvider`, but only returns a provider that actually supports the requested capability. */
export function resolveProviderForCapability(capability: keyof AiProvider["capabilities"], preferred?: AiProviderKeyLiteral): AiProvider {
  const providers = getProviders();
  const order: AiProviderKeyLiteral[] = preferred
    ? [preferred, ...(["OPENAI", "ANTHROPIC"] as const).filter((k) => k !== preferred)]
    : [AI_PRIMARY_PROVIDER as AiProviderKeyLiteral, ...(["OPENAI", "ANTHROPIC"] as const)];

  for (const key of order) {
    const provider = providers[key];
    if (provider?.capabilities[capability]) return provider;
  }

  throw new AiNotConfiguredError(
    Object.keys(providers).length === 0
      ? undefined
      : `No configured AI provider supports "${capability}" — add a provider that does.`
  );
}
