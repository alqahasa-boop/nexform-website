import { db } from "@/lib/db";
import type { AiConceptKind, AiAnalysisStatus, Prisma } from "@/generated/prisma/client";

export interface CreateConceptInput {
  userId?: string;
  guestSessionId?: string;
  conversationId?: string;
  kind: AiConceptKind;
  roomType?: string;
  propertyType?: string;
  dimensions?: Prisma.InputJsonValue;
  budgetMin?: number;
  budgetMax?: number;
  styleNames?: string[];
  inputData: Prisma.InputJsonValue;
  facadeUploadedFileId?: string;
}

export function createConcept(input: CreateConceptInput) {
  return db.aiGeneratedConcept.create({
    data: {
      ...input,
      status: "PENDING",
    },
  });
}

export function getConceptById(id: string) {
  return db.aiGeneratedConcept.findUnique({ where: { id } });
}

export function conceptBelongsTo(
  concept: { userId: string | null; guestSessionId: string | null },
  identity: { userId?: string; guestSessionId?: string }
): boolean {
  if (identity.userId) return concept.userId === identity.userId;
  if (identity.guestSessionId) return concept.guestSessionId === identity.guestSessionId;
  return false;
}

export function setConceptResult(
  id: string,
  status: AiAnalysisStatus,
  data?: { generatedText?: string; inspirationDesignIdeaIds?: string[] }
) {
  return db.aiGeneratedConcept.update({
    where: { id },
    data: { status, ...data },
  });
}

export function markConceptConverted(id: string, designRequestId: string) {
  return db.aiGeneratedConcept.update({ where: { id }, data: { convertedToDesignRequestId: designRequestId } });
}

export function listMyConcepts(identity: { userId?: string; guestSessionId?: string }, kind?: AiConceptKind) {
  return db.aiGeneratedConcept.findMany({
    where: identity.userId
      ? { userId: identity.userId, ...(kind && { kind }) }
      : { guestSessionId: identity.guestSessionId, ...(kind && { kind }) },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}
