import { z } from "zod";

export const mediaKindSchema = z.enum(["IMAGE", "PDF", "DOCUMENT", "VIDEO"]);

export const createMediaAssetSchema = z.object({
  kind: mediaKindSchema,
  fileName: z.string().min(1).max(255),
  // Not `.url()` — the local storage driver returns a site-relative path ("/uploads/xxx.png"),
  // not an absolute URL. This value comes from the storage service, never directly from the client.
  url: z.string().min(1).max(2048),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  alt: z.string().max(300).optional(),
  folderId: z.string().uuid().optional(),
  uploadedById: z.string().uuid(),
});
export type CreateMediaAssetInput = z.infer<typeof createMediaAssetSchema>;

export const updateMediaAssetSchema = createMediaAssetSchema
  .partial()
  .omit({ uploadedById: true, kind: true, sizeBytes: true });
export type UpdateMediaAssetInput = z.infer<typeof updateMediaAssetSchema>;

export const createFolderSchema = z.object({
  name: z.string().min(1).max(120),
  parentId: z.string().uuid().optional(),
});
export type CreateFolderInput = z.infer<typeof createFolderSchema>;

export const renameFolderSchema = z.object({ name: z.string().min(1).max(120) });
export type RenameFolderInput = z.infer<typeof renameFolderSchema>;
