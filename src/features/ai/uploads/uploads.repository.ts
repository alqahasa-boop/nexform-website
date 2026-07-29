import { db } from "@/lib/db";
import type { AiAnalysisStatus, AiFileKind, Prisma } from "@/generated/prisma/client";

export interface CreateUploadedFileInput {
  userId?: string;
  guestSessionId?: string;
  conversationId?: string;
  fileName: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  extractedText?: string;
  analysisStatus: AiAnalysisStatus;
}

export function createUploadedFile(kind: AiFileKind, input: CreateUploadedFileInput) {
  return db.aiUploadedFile.create({ data: { ...input, kind } });
}

export function getUploadedFileById(id: string) {
  return db.aiUploadedFile.findUnique({ where: { id } });
}

export function fileBelongsTo(
  file: { userId: string | null; guestSessionId: string | null },
  identity: { userId?: string; guestSessionId?: string }
): boolean {
  if (identity.userId) return file.userId === identity.userId;
  if (identity.guestSessionId) return file.guestSessionId === identity.guestSessionId;
  return false;
}

export function setAnalysisResult(
  id: string,
  analysisStatus: AiAnalysisStatus,
  analysisResult?: Prisma.InputJsonValue,
  analysisError?: string
) {
  return db.aiUploadedFile.update({
    where: { id },
    data: { analysisStatus, ...(analysisResult !== undefined && { analysisResult }), ...(analysisError && { analysisError }) },
  });
}

export function listMyUploadedFiles(identity: { userId?: string; guestSessionId?: string }, kind?: AiFileKind) {
  return db.aiUploadedFile.findMany({
    where: {
      ...(identity.userId ? { userId: identity.userId } : { guestSessionId: identity.guestSessionId }),
      ...(kind && { kind }),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export function deleteUploadedFile(id: string) {
  return db.aiUploadedFile.delete({ where: { id } });
}

/** Admin observability — overall upload volume by kind (document/image) and analysis outcome. */
export async function getUploadedFileStats() {
  const [total, byKind, byStatus] = await Promise.all([
    db.aiUploadedFile.count(),
    db.aiUploadedFile.groupBy({ by: ["kind"], _count: { _all: true } }),
    db.aiUploadedFile.groupBy({ by: ["analysisStatus"], _count: { _all: true } }),
  ]);

  return {
    total,
    byKind: byKind.map((row) => ({ kind: row.kind, count: row._count._all })),
    byStatus: byStatus.map((row) => ({ status: row.analysisStatus, count: row._count._all })),
  };
}
