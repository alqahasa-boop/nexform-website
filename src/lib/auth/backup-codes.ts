import { randomBytes } from "crypto";
import { hashPassword, verifyPassword } from "./password";

const BACKUP_CODE_COUNT = 8;

/** Generates plaintext one-time backup codes (shown once) — callers must hash before storing. */
export function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => randomBytes(5).toString("hex"));
}

export function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => hashPassword(code)));
}

/** Checks a submitted code against the stored hashes; returns the matched hash so the caller can remove it (one-time use). */
export async function matchBackupCode(code: string, hashedCodes: string[]): Promise<string | null> {
  for (const hashed of hashedCodes) {
    if (await verifyPassword(code, hashed)) return hashed;
  }
  return null;
}
