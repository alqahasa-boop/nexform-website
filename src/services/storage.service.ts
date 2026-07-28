import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { put, del } from "@vercel/blob";
import { sanitizeFileName } from "@/lib/security/file-validation";

/**
 * Provider-agnostic file storage. `driver` is picked once at module load based on
 * environment (see bottom of file) so every upload flow (media library, articles,
 * library files) codes against the same `StorageDriver` interface regardless of
 * which backend is actually storing the bytes.
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

/**
 * Local-disk driver — writes to /public/uploads. Only suitable for local development:
 * Vercel's serverless filesystem is read-only outside of /tmp and is wiped on every
 * cold start/redeploy, so files written here never survive in production.
 */
class LocalDiskStorageDriver implements StorageDriver {
  private readonly uploadsDir = join(process.cwd(), "public", "uploads");

  async upload({ buffer, fileName }: UploadInput): Promise<UploadResult> {
    await mkdir(this.uploadsDir, { recursive: true });

    const safeName = sanitizeFileName(fileName);
    const uniqueName = `${randomUUID()}-${safeName}`;
    await writeFile(join(this.uploadsDir, uniqueName), buffer);

    return { url: `/uploads/${uniqueName}`, path: uniqueName };
  }

  async delete(url: string): Promise<void> {
    const { unlink } = await import("fs/promises");
    const fileName = url.replace(/^\/uploads\//, "");
    await unlink(join(this.uploadsDir, fileName)).catch(() => undefined);
  }
}

/**
 * Vercel Blob driver — persistent, CDN-backed storage that survives redeploys and
 * cold starts. Requires `BLOB_READ_WRITE_TOKEN`, which Vercel injects automatically
 * once a Blob store is created and linked to the project (`vercel blob create-store`).
 */
class VercelBlobStorageDriver implements StorageDriver {
  async upload({ buffer, fileName }: UploadInput): Promise<UploadResult> {
    const safeName = sanitizeFileName(fileName);
    const uniqueName = `${randomUUID()}-${safeName}`;

    const blob = await put(`uploads/${uniqueName}`, buffer, {
      access: "public",
      addRandomSuffix: false,
    });

    return { url: blob.url, path: blob.pathname };
  }

  async delete(url: string): Promise<void> {
    await del(url).catch(() => undefined);
  }
}

let driver: StorageDriver = process.env.BLOB_READ_WRITE_TOKEN
  ? new VercelBlobStorageDriver()
  : new LocalDiskStorageDriver();

/** Mainly for tests — swap the active driver at runtime. */
export function setStorageDriver(nextDriver: StorageDriver) {
  driver = nextDriver;
}

export function uploadFile(input: UploadInput): Promise<UploadResult> {
  return driver.upload(input);
}

/** Pass the asset's stored `url` — each driver knows how to translate that into its own delete call. */
export function deleteFile(url: string): Promise<void> {
  return driver.delete(url);
}
