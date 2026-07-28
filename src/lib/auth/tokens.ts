import { randomBytes, createHash } from "crypto";
import { db } from "@/lib/db";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

/** Only the hash is ever persisted — a database dump can't be replayed into a working reset link. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issues a password-reset token. Returns the raw `token` for the caller to embed in the
 * reset URL (see services/email.service.ts) — only its hash is stored.
 */
export async function createPasswordResetToken(userId: string) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  const record = await db.passwordResetToken.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });

  return { ...record, token };
}

export async function consumePasswordResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;

  await db.passwordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record;
}

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Reuses Auth.js's built-in VerificationToken table for email-verification links. */
export async function createEmailVerificationToken(email: string) {
  const token = generateSecureToken();
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  return db.verificationToken.create({
    data: { identifier: email, token, expires },
  });
}

export async function consumeEmailVerificationToken(email: string, token: string) {
  const record = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });
  if (!record || record.expires < new Date()) return null;

  await db.verificationToken.delete({
    where: { identifier_token: { identifier: email, token } },
  });

  return record;
}
