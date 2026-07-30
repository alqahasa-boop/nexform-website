"use server";

import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth/admin-session";
import { getOrCreateGuestSessionId } from "@/lib/ai/guest-session";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { validateUpload, sanitizeFileName } from "@/lib/security/file-validation";
import { uploadFile, deleteFile } from "@/services/storage.service";
import { runChatTask } from "@/lib/ai/orchestrator";
import { isAiConfigured } from "@/lib/ai/provider-registry";
import { AI_LIMITS } from "@/config/ai.config";
import { findRelevantKnowledge } from "@/features/ai/knowledge/knowledge-retrieval";
import { extractTextFromFile } from "./text-extraction";
import {
  createUploadedFile,
  getUploadedFileById,
  fileBelongsTo,
  setAnalysisResult,
  listMyUploadedFiles,
  deleteUploadedFile,
} from "@/features/ai/uploads/uploads.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

const DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function resolveIdentity() {
  const session = await getAdminSession();
  if (session) return { userId: session.id, guestSessionId: undefined };
  return { userId: undefined, guestSessionId: await getOrCreateGuestSessionId() };
}

export interface UploadedDocumentSummary {
  id: string;
  fileName: string;
  url: string;
  extractedTextPreview: string;
  analysisStatus: string;
}

export async function uploadDocumentAction(formData: FormData): Promise<ApiResult<UploadedDocumentSummary>> {
  const identity = await resolveIdentity();
  const rateKey = identity.userId ? `ai-doc-upload:user:${identity.userId}` : `ai-doc-upload:guest:${identity.guestSessionId}`;
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.aiDocumentUpload });
  if (!allowed) return apiError("Too many document uploads — please wait a moment and try again.", "RATE_LIMITED");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return apiError("No file provided.", "INVALID_INPUT");
  if (!DOCUMENT_MIME_TYPES.has(file.type)) {
    return apiError("Only PDF and Word (.docx) documents are supported for AI analysis.", "INVALID_INPUT");
  }

  const kind = file.type === "application/pdf" ? "PDF" : "DOCUMENT";
  const validation = validateUpload({ mimeType: file.type, sizeBytes: file.size, kind, fileName: file.name });
  if (!validation.valid) return apiError(validation.error ?? "Invalid file.", "INVALID_INPUT");

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFileName(file.name);

  let extractedText: string;
  try {
    const extraction = await extractTextFromFile(buffer, file.type);
    extractedText = extraction.text.slice(0, AI_LIMITS.maxDocumentTextChars);
  } catch {
    return apiError("Could not read this document — it may be corrupted, scanned/image-only, or password-protected.", "EXTRACTION_FAILED");
  }

  if (!extractedText.trim()) {
    return apiError("No readable text was found in this document (it may be a scanned image without a text layer).", "NO_TEXT");
  }

  const uploaded = await uploadFile({ buffer, fileName: safeName, mimeType: file.type });

  const record = await createUploadedFile("DOCUMENT", {
    ...identity,
    fileName: safeName,
    url: uploaded.url,
    mimeType: file.type,
    sizeBytes: file.size,
    extractedText,
    analysisStatus: isAiConfigured() ? "PENDING" : "NOT_CONFIGURED",
  });

  return apiSuccess({
    id: record.id,
    fileName: record.fileName,
    url: record.url,
    extractedTextPreview: extractedText.slice(0, 500),
    analysisStatus: record.analysisStatus,
  });
}

export interface AnalyzeDocumentResult {
  status: "ok" | "not_configured";
  response: string | null;
  relatedArticles: { title: string; href: string }[];
}

const RELATED_ARTICLE_HREF: Record<string, string> = {
  Content: "/knowledge",
  FaqItem: "/knowledge/faq",
  ConstructionLibraryItem: "/knowledge/library",
  ConstructionJourneyStage: "/knowledge/build-journey",
};

async function resolveRelatedArticleTitle(entityType: string, entityId: string): Promise<string | null> {
  switch (entityType) {
    case "Content": {
      const row = await db.content.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    case "FaqItem": {
      const row = await db.faqItem.findUnique({ where: { id: entityId }, select: { question: true } });
      return row?.question ?? null;
    }
    case "ConstructionLibraryItem": {
      const row = await db.constructionLibraryItem.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    case "ConstructionJourneyStage": {
      const row = await db.constructionJourneyStage.findUnique({ where: { id: entityId }, select: { title: true } });
      return row?.title ?? null;
    }
    default:
      return null;
  }
}

export async function analyzeDocumentAction(fileId: string, instruction: string, language: string): Promise<ApiResult<AnalyzeDocumentResult>> {
  const identity = await resolveIdentity();
  const file = await getUploadedFileById(fileId);
  if (!file || !fileBelongsTo(file, identity)) return apiError("File not found.", "NOT_FOUND");
  if (!file.extractedText) return apiError("This file has no extracted text to analyze.", "NO_TEXT");

  if (!isAiConfigured()) {
    return apiSuccess({ status: "not_configured", response: null, relatedArticles: [] });
  }

  const trimmedInstruction = instruction.trim() || "Summarize this document in plain language.";

  try {
    await setAnalysisResult(fileId, "PROCESSING");
    const result = await runChatTask({
      module: "DOCUMENT_AI",
      messages: [{ role: "user", content: trimmedInstruction }],
      language,
      knowledgeContext: `Document "${file.fileName}" extracted text:\n\n${file.extractedText}`,
      context: identity,
    });

    await setAnalysisResult(fileId, "COMPLETE", { instruction: trimmedInstruction, response: result.content, respondedAt: new Date().toISOString() });

    const matches = await findRelevantKnowledge(file.extractedText.slice(0, 500), language, 3);
    const relatedArticles: { title: string; href: string }[] = [];
    for (const match of matches) {
      const href = RELATED_ARTICLE_HREF[match.entityType];
      if (!href) continue;
      const title = await resolveRelatedArticleTitle(match.entityType, match.entityId);
      if (title) relatedArticles.push({ title, href });
    }

    return apiSuccess({ status: "ok", response: result.content, relatedArticles });
  } catch (error) {
    await setAnalysisResult(fileId, "FAILED", undefined, error instanceof Error ? error.message : "Unknown error.");
    return apiSuccess({ status: "not_configured", response: null, relatedArticles: [] });
  }
}

export async function listMyDocumentsAction(): Promise<ApiResult<UploadedDocumentSummary[]>> {
  const identity = await resolveIdentity();
  const files = await listMyUploadedFiles(identity, "DOCUMENT");
  return apiSuccess(
    files.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      url: f.url,
      extractedTextPreview: (f.extractedText ?? "").slice(0, 500),
      analysisStatus: f.analysisStatus,
    }))
  );
}

export async function deleteMyDocumentAction(fileId: string): Promise<ApiResult<null>> {
  const identity = await resolveIdentity();
  const file = await getUploadedFileById(fileId);
  if (!file || !fileBelongsTo(file, identity)) return apiError("File not found.", "NOT_FOUND");
  await deleteUploadedFile(fileId);
  await deleteFile(file.url).catch(() => undefined);
  return apiSuccess(null);
}
