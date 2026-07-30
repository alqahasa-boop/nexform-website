"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getOrCreateGuestSessionId } from "@/lib/ai/guest-session";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { validateUpload, sanitizeFileName } from "@/lib/security/file-validation";
import { uploadFile, deleteFile } from "@/services/storage.service";
import { runVisionTask } from "@/lib/ai/orchestrator";
import { isAiConfigured } from "@/lib/ai/provider-registry";
import { listPublishedServices } from "@/features/services/services.repository";
import { findMatchingCompanies } from "@/features/companies/companies.repository";
import {
  createUploadedFile,
  getUploadedFileById,
  fileBelongsTo,
  setAnalysisResult,
  listMyUploadedFiles,
  deleteUploadedFile,
} from "@/features/ai/uploads/uploads.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

async function resolveIdentity() {
  const session = await getAdminSession();
  if (session) return { userId: session.id, guestSessionId: undefined };
  return { userId: undefined, guestSessionId: await getOrCreateGuestSessionId() };
}

export interface UploadedImageSummary {
  id: string;
  fileName: string;
  url: string;
  analysisStatus: string;
}

export async function uploadImageForAnalysisAction(formData: FormData): Promise<ApiResult<UploadedImageSummary>> {
  const identity = await resolveIdentity();
  const rateKey = identity.userId ? `ai-image-upload:user:${identity.userId}` : `ai-image-upload:guest:${identity.guestSessionId}`;
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.aiVision });
  if (!allowed) return apiError("Too many image uploads — please wait a moment and try again.", "RATE_LIMITED");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return apiError("No file provided.", "INVALID_INPUT");

  const validation = validateUpload({ mimeType: file.type, sizeBytes: file.size, kind: "IMAGE", fileName: file.name });
  if (!validation.valid) return apiError(validation.error ?? "Invalid image.", "INVALID_INPUT");

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = sanitizeFileName(file.name);
  const uploaded = await uploadFile({ buffer, fileName: safeName, mimeType: file.type });

  const record = await createUploadedFile("IMAGE", {
    ...identity,
    fileName: safeName,
    url: uploaded.url,
    mimeType: file.type,
    sizeBytes: file.size,
    analysisStatus: isAiConfigured() ? "PENDING" : "NOT_CONFIGURED",
  });

  return apiSuccess({ id: record.id, fileName: record.fileName, url: record.url, analysisStatus: record.analysisStatus });
}

export interface AnalyzeImageResult {
  status: "ok" | "not_configured";
  response: string | null;
  recommendedServices: { slug: string; title: string }[];
  recommendedCompanies: { slug: string; name: string }[];
}

const DEFAULT_IMAGE_PROMPT =
  "Describe what's in this image, note anything visually notable (including possible visible issues like cracks, water stains, or uneven surfaces), and suggest improvements where relevant.";

export async function analyzeImageAction(fileId: string, question: string, language: string): Promise<ApiResult<AnalyzeImageResult>> {
  const identity = await resolveIdentity();
  const file = await getUploadedFileById(fileId);
  if (!file || !fileBelongsTo(file, identity) || file.kind !== "IMAGE") return apiError("Image not found.", "NOT_FOUND");

  if (!isAiConfigured()) {
    return apiSuccess({ status: "not_configured", response: null, recommendedServices: [], recommendedCompanies: [] });
  }

  const prompt = question.trim() || DEFAULT_IMAGE_PROMPT;

  try {
    await setAnalysisResult(fileId, "PROCESSING");
    const result = await runVisionTask({
      module: "IMAGE_AI",
      imageUrl: file.url,
      prompt,
      language,
      context: identity,
    });

    await setAnalysisResult(fileId, "COMPLETE", { question: prompt, response: result.content, respondedAt: new Date().toISOString() });

    // Real, existing content — not AI-invented recommendations — surfaced alongside the analysis.
    const [services, companies] = await Promise.all([
      listPublishedServices(language).then((rows) => rows.slice(0, 3)),
      findMatchingCompanies({ limit: 3 }),
    ]);

    return apiSuccess({
      status: "ok",
      response: result.content,
      recommendedServices: services.map((s) => ({ slug: s.slug, title: s.title })),
      recommendedCompanies: companies.map((c) => ({ slug: c.slug, name: c.name })),
    });
  } catch (error) {
    await setAnalysisResult(fileId, "FAILED", undefined, error instanceof Error ? error.message : "Unknown error.");
    return apiSuccess({ status: "not_configured", response: null, recommendedServices: [], recommendedCompanies: [] });
  }
}

export async function listMyImagesAction(): Promise<ApiResult<UploadedImageSummary[]>> {
  const identity = await resolveIdentity();
  const files = await listMyUploadedFiles(identity, "IMAGE");
  return apiSuccess(files.map((f) => ({ id: f.id, fileName: f.fileName, url: f.url, analysisStatus: f.analysisStatus })));
}

export async function deleteMyImageAction(fileId: string): Promise<ApiResult<null>> {
  const identity = await resolveIdentity();
  const file = await getUploadedFileById(fileId);
  if (!file || !fileBelongsTo(file, identity)) return apiError("File not found.", "NOT_FOUND");
  await deleteUploadedFile(fileId);
  await deleteFile(file.url).catch(() => undefined);
  return apiSuccess(null);
}
