import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { sanitizeFileName } from "@/lib/security/file-validation";

/**
 * Provider-agnostic file storage. No provider is chosen yet — Phase 2 picks
 * S3 / Supabase Storage / R2 / etc. The `StorageDriver` interface is what
 * every upload flow (media library, articles, library files) codes against,
 * so switching providers later never touches call sites.
 */
export interface UploadInput {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface UploadResult {
  url: string;
  path: string;
}

export interface StorageDriver {
  upload(input: UploadInput): Promise<UploadResult>;
  delete(path: string): Promise<void>;
}

/** Default driver for local development — writes to /public/uploads. Not suitable for production (ephemeral filesystems). */
class LocalDiskStorageDriver implements StorageDriver {
  private readonly uploadsDir = join(process.cwd(), "public", "uploads");

  async upload({ buffer, fileName }: UploadInput): Promise<UploadResult> {
    await mkdir(this.uploadsDir, { recursive: true });

    const safeName = sanitizeFileName(fileName);
    const uniqueName = `${randomUUID()}-${safeName}`;
    await writeFile(join(this.uploadsDir, uniqueName), buffer);

    return { url: `/uploads/${uniqueName}`, path: uniqueName };
  }

  async delete(path: string): Promise<void> {
    const { unlink } = await import("fs/promises");
    await unlink(join(this.uploadsDir, path)).catch(() => undefined);
  }
}

let driver: StorageDriver = new LocalDiskStorageDriver();

/** Phase 2: call this once at startup with a real driver (e.g. an S3-backed implementation). */
export function setStorageDriver(nextDriver: StorageDriver) {
  driver = nextDriver;
}

export function uploadFile(input: UploadInput): Promise<UploadResult> {
  return driver.upload(input);
}

export function deleteFile(path: string): Promise<void> {
  return driver.delete(path);
}
