"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getOrCreateGuestSessionId, getGuestSessionId } from "@/lib/ai/guest-session";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { validateChatPrompt } from "@/lib/security/ai-prompt-validation";
import { isAiConfigured } from "@/lib/ai/provider-registry";
import { runChatTask } from "@/lib/ai/orchestrator";
import { isModuleEnabled } from "@/features/ai/settings/settings.repository";
import { findMatchingDesignIdeas } from "@/features/design-ideas/design-ideas.repository";
import { createConversation, appendMessage } from "@/features/ai/conversations/conversations.repository";
import { createConcept, getConceptById, conceptBelongsTo, setConceptResult, listMyConcepts } from "./concepts.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";
import type { AiConceptKind } from "@/generated/prisma/client";

async function resolveIdentity() {
  const session = await getAdminSession();
  if (session) return { userId: session.id, guestSessionId: undefined };
  return { userId: undefined, guestSessionId: await getOrCreateGuestSessionId() };
}

export interface InteriorDesignerInput {
  roomType: string;
  dimensions?: { length?: number; width?: number };
  ceilingHeight?: number;
  doorLocations?: string;
  windowLocations?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredStyle?: string;
  colorPreferences?: string;
  lightingPreferences?: string;
  furnitureRequirements?: string;
  familyRequirements?: string;
  childrenRequirements?: string;
  accessibilityRequirements?: string;
  specialNotes?: string;
  language: string;
}

export interface ConceptResult {
  conceptId: string;
  status: "ok" | "not_configured";
  generatedText: string | null;
  inspiration: { id: string; slug: string; title: string; imageUrl: string | null }[];
}

function buildInteriorPrompt(input: InteriorDesignerInput): string {
  const lines: string[] = [`Room type: ${input.roomType}`];
  if (input.dimensions?.length || input.dimensions?.width) {
    lines.push(`Dimensions: ${input.dimensions?.length ?? "?"}m x ${input.dimensions?.width ?? "?"}m`);
  }
  if (input.ceilingHeight) lines.push(`Ceiling height: ${input.ceilingHeight}m`);
  if (input.doorLocations) lines.push(`Door locations: ${input.doorLocations}`);
  if (input.windowLocations) lines.push(`Window locations: ${input.windowLocations}`);
  if (input.budgetMin || input.budgetMax) lines.push(`Budget: ${input.budgetMin ?? "?"}-${input.budgetMax ?? "?"} KWD`);
  if (input.preferredStyle) lines.push(`Preferred style: ${input.preferredStyle}`);
  if (input.colorPreferences) lines.push(`Color preferences: ${input.colorPreferences}`);
  if (input.lightingPreferences) lines.push(`Lighting preferences: ${input.lightingPreferences}`);
  if (input.furnitureRequirements) lines.push(`Furniture requirements: ${input.furnitureRequirements}`);
  if (input.familyRequirements) lines.push(`Family requirements: ${input.familyRequirements}`);
  if (input.childrenRequirements) lines.push(`Children requirements: ${input.childrenRequirements}`);
  if (input.accessibilityRequirements) lines.push(`Accessibility requirements: ${input.accessibilityRequirements}`);
  if (input.specialNotes) lines.push(`Special notes: ${input.specialNotes}`);
  return `Generate an interior design concept for this room:\n\n${lines.join("\n")}`;
}

export async function generateInteriorConceptAction(input: InteriorDesignerInput): Promise<ApiResult<ConceptResult>> {
  if (!(await isModuleEnabled("INTERIOR_DESIGNER"))) {
    return apiError("The interior designer is temporarily unavailable — please try again later.", "MODULE_DISABLED");
  }

  const identity = await resolveIdentity();
  const rateKey = identity.userId ? `ai-concept:user:${identity.userId}` : `ai-concept:guest:${identity.guestSessionId}`;
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.aiConcept });
  if (!allowed) return apiError("Too many requests — please wait a moment and try again.", "RATE_LIMITED");

  if (!input.roomType?.trim()) return apiError("Room type is required.", "VALIDATION");

  const prompt = buildInteriorPrompt(input);
  const validation = validateChatPrompt(prompt);
  if (!validation.valid) return apiError(validation.error ?? "Invalid input.", "VALIDATION");

  const inspiration = await findMatchingDesignIdeas({
    language: input.language,
    roomType: input.roomType,
    styleNames: input.preferredStyle ? [input.preferredStyle] : [],
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    limit: 4,
  });

  const concept = await createConcept({
    ...identity,
    kind: "INTERIOR" as AiConceptKind,
    roomType: input.roomType,
    dimensions: input.dimensions,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    styleNames: input.preferredStyle ? [input.preferredStyle] : [],
    inputData: JSON.parse(JSON.stringify(input)),
  });

  const inspirationSummary = inspiration
    .map((idea, i) => `[${i + 1}] "${idea.title}" — ${idea.roomType ?? "room"}, styles: ${idea.styles.map((s) => s.style.name).join(", ") || "n/a"}`)
    .join("\n");

  if (!isAiConfigured()) {
    await setConceptResult(concept.id, "NOT_CONFIGURED");
    return apiSuccess({
      conceptId: concept.id,
      status: "not_configured",
      generatedText: null,
      inspiration: inspiration.map((i) => ({ id: i.id, slug: i.slug, title: i.title, imageUrl: i.coverImage?.url ?? null })),
    });
  }

  try {
    const conversation = await createConversation({ ...identity, module: "INTERIOR_DESIGNER", language: input.language, title: `Interior concept — ${input.roomType}` });
    await appendMessage({ conversationId: conversation.id, role: "USER", content: prompt });

    const result = await runChatTask({
      module: "INTERIOR_DESIGNER",
      messages: [{ role: "user", content: prompt }],
      language: input.language,
      knowledgeContext: inspirationSummary || undefined,
      context: identity,
    });

    await appendMessage({ conversationId: conversation.id, role: "ASSISTANT", content: result.content, providerKey: result.providerKey, model: result.model });
    await setConceptResult(concept.id, "COMPLETE", {
      generatedText: result.content,
      inspirationDesignIdeaIds: inspiration.map((i) => i.id),
    });

    return apiSuccess({
      conceptId: concept.id,
      status: "ok",
      generatedText: result.content,
      inspiration: inspiration.map((i) => ({ id: i.id, slug: i.slug, title: i.title, imageUrl: i.coverImage?.url ?? null })),
    });
  } catch {
    await setConceptResult(concept.id, "FAILED");
    return apiSuccess({
      conceptId: concept.id,
      status: "not_configured",
      generatedText: null,
      inspiration: inspiration.map((i) => ({ id: i.id, slug: i.slug, title: i.title, imageUrl: i.coverImage?.url ?? null })),
    });
  }
}

export async function getConceptAction(conceptId: string): Promise<ApiResult<NonNullable<Awaited<ReturnType<typeof getConceptById>>>>> {
  const identity = await resolveIdentity();
  const concept = await getConceptById(conceptId);
  if (!concept || !conceptBelongsTo(concept, identity)) return apiError("Concept not found.", "NOT_FOUND");
  return apiSuccess(concept);
}

export async function listMyConceptsAction(kind?: AiConceptKind): Promise<ApiResult<Awaited<ReturnType<typeof listMyConcepts>>>> {
  const session = await getAdminSession();
  const guestSessionId = session ? undefined : await getGuestSessionId();
  if (!session && !guestSessionId) return apiSuccess([]);
  const concepts = await listMyConcepts({ userId: session?.id, guestSessionId: guestSessionId ?? undefined }, kind);
  return apiSuccess(concepts);
}
