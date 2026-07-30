"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getOrCreateGuestSessionId, getGuestSessionId } from "@/lib/ai/guest-session";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { isAiConfigured } from "@/lib/ai/provider-registry";
import { runVisionTask } from "@/lib/ai/orchestrator";
import { isModuleEnabled } from "@/features/ai/settings/settings.repository";
import { getUploadedFileById, fileBelongsTo } from "@/features/ai/uploads/uploads.repository";
import { findMatchingDesignIdeas } from "@/features/design-ideas/design-ideas.repository";
import { createConcept, setConceptResult, listMyConcepts } from "./concepts.repository";
import { EXTERIOR_STYLES } from "./exterior-styles";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";
import type { AiConceptKind } from "@/generated/prisma/client";

async function resolveIdentity() {
  const session = await getAdminSession();
  if (session) return { userId: session.id, guestSessionId: undefined };
  return { userId: undefined, guestSessionId: await getOrCreateGuestSessionId() };
}

export interface ExteriorDesignerInput {
  facadeFileId: string;
  style: string;
  notes?: string;
  budgetMin?: number;
  budgetMax?: number;
  language: string;
}

export interface ConceptResult {
  conceptId: string;
  status: "ok" | "not_configured";
  generatedText: string | null;
  inspiration: { id: string; slug: string; title: string; imageUrl: string | null }[];
}

export async function generateExteriorConceptAction(input: ExteriorDesignerInput): Promise<ApiResult<ConceptResult>> {
  if (!(await isModuleEnabled("EXTERIOR_DESIGNER"))) {
    return apiError("The exterior designer is temporarily unavailable — please try again later.", "MODULE_DISABLED");
  }

  const identity = await resolveIdentity();
  const rateKey = identity.userId ? `ai-concept:user:${identity.userId}` : `ai-concept:guest:${identity.guestSessionId}`;
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.aiConcept });
  if (!allowed) return apiError("Too many requests — please wait a moment and try again.", "RATE_LIMITED");

  if (!EXTERIOR_STYLES.includes(input.style as (typeof EXTERIOR_STYLES)[number])) {
    return apiError("Please choose a valid style.", "VALIDATION");
  }

  const file = await getUploadedFileById(input.facadeFileId);
  if (!file || !fileBelongsTo(file, identity) || file.kind !== "IMAGE") {
    return apiError("Facade image not found — please upload it again.", "NOT_FOUND");
  }

  const inspiration = await findMatchingDesignIdeas({
    language: input.language,
    styleNames: [input.style],
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    limit: 4,
  });

  const concept = await createConcept({
    ...identity,
    kind: "EXTERIOR" as AiConceptKind,
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    styleNames: [input.style],
    inputData: JSON.parse(JSON.stringify(input)),
    facadeUploadedFileId: file.id,
  });

  if (!isAiConfigured()) {
    await setConceptResult(concept.id, "NOT_CONFIGURED");
    return apiSuccess({
      conceptId: concept.id,
      status: "not_configured",
      generatedText: null,
      inspiration: inspiration.map((i) => ({ id: i.id, slug: i.slug, title: i.title, imageUrl: i.coverImage?.url ?? null })),
    });
  }

  const prompt = `Analyze this facade photo and suggest a ${input.style}-style exterior concept: material and color improvements, landscape ideas, lighting, entry/door improvements, parking suggestions, garden concepts, and privacy improvements.${input.notes ? ` Additional notes from the user: ${input.notes}` : ""}`;

  try {
    const result = await runVisionTask({
      module: "EXTERIOR_DESIGNER",
      imageUrl: file.url,
      prompt,
      language: input.language,
      context: identity,
    });

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

export async function listMyExteriorConceptsAction(): Promise<ApiResult<Awaited<ReturnType<typeof listMyConcepts>>>> {
  const session = await getAdminSession();
  const guestSessionId = session ? undefined : await getGuestSessionId();
  if (!session && !guestSessionId) return apiSuccess([]);
  const concepts = await listMyConcepts({ userId: session?.id, guestSessionId: guestSessionId ?? undefined }, "EXTERIOR");
  return apiSuccess(concepts);
}
