"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getOrCreateGuestSessionId } from "@/lib/ai/guest-session";
import { createDesignRequestAction } from "@/features/design-requests/design-requests.actions";
import { findStyleIdsByNames } from "@/features/styles/styles.repository";
import { getConceptById, conceptBelongsTo, markConceptConverted } from "./concepts.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export interface ConvertConceptInput {
  conceptId: string;
  fullName: string;
  email: string;
  phone?: string;
  notes?: string;
}

/**
 * The Module 12 handoff: turns an AI-generated concept (interior or
 * exterior) into a real `DesignRequest` an engineering office can act on.
 * Images aren't attached as `DesignRequestImage` rows — those require a
 * `MediaAsset` (admin CMS media library), and AI uploads deliberately live
 * outside that library (see Phase 6A notes) so guests never need
 * `media:create` permission. The facade photo URL is included as plain text
 * in `notes` instead — a real, working link, not a missing feature.
 */
export async function convertConceptToDesignRequestAction(input: ConvertConceptInput): Promise<ApiResult<{ requestNumber: string }>> {
  const session = await getAdminSession();
  const identity = session ? { userId: session.id, guestSessionId: undefined } : { userId: undefined, guestSessionId: await getOrCreateGuestSessionId() };

  const concept = await getConceptById(input.conceptId);
  if (!concept || !conceptBelongsTo(concept, identity)) return apiError("Concept not found.", "NOT_FOUND");
  if (concept.convertedToDesignRequestId) return apiError("This concept was already sent to an engineering office.", "ALREADY_CONVERTED");

  const styleIds = await findStyleIdsByNames(concept.styleNames);

  const noteParts: string[] = [`AI-generated ${concept.kind === "INTERIOR" ? "interior" : "exterior"} concept:`];
  if (input.notes?.trim()) noteParts.push(input.notes.trim());
  if (concept.generatedText) noteParts.push(concept.generatedText);
  if (concept.facadeUploadedFileId) {
    const { getUploadedFileById } = await import("@/features/ai/uploads/uploads.repository");
    const facade = await getUploadedFileById(concept.facadeUploadedFileId);
    if (facade) noteParts.push(`Facade photo: ${facade.url}`);
  }

  const result = await createDesignRequestAction({
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    roomType: concept.roomType ?? undefined,
    budgetMin: concept.budgetMin ? Number(concept.budgetMin) : undefined,
    budgetMax: concept.budgetMax ? Number(concept.budgetMax) : undefined,
    notes: noteParts.join("\n\n").slice(0, 4000),
    preferredStyleIds: styleIds,
  });

  if (!result.success) return result;

  await markConceptConverted(concept.id, result.data.id);
  return apiSuccess({ requestNumber: result.data.requestNumber });
}
