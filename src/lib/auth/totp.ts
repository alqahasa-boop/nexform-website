import { createHmac, randomBytes } from "crypto";

/**
 * RFC 6238 TOTP, implemented directly on Node's `crypto` (HMAC-SHA1) rather than pulling in a
 * third-party authenticator package — after the isomorphic-dompurify/jsdom incident earlier in
 * this project (an ESM-only transitive dependency broke under Vercel's Turbopack server runtime),
 * a small, dependency-free, easily-audited implementation is the safer choice here.
 */
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const STEP_SECONDS = 30;
const CODE_DIGITS = 6;
const WINDOW = 1; // accept the previous/next 30s step to tolerate clock drift

function base32Encode(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
  let output = "";
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += BASE32_ALPHABET[parseInt(bits.slice(i, i + 5), 2)];
  }
  const remainder = bits.length % 5;
  if (remainder > 0) {
    const lastChunk = bits.slice(bits.length - remainder).padEnd(5, "0");
    output += BASE32_ALPHABET[parseInt(lastChunk, 2)];
  }
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20)); // 160-bit secret, standard for authenticator apps
}

function hotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = createHmac("sha1", key).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** CODE_DIGITS).padStart(CODE_DIGITS, "0");
}

export function generateTotpCode(secret: string, at: number = Date.now()): string {
  return hotp(secret, Math.floor(at / 1000 / STEP_SECONDS));
}

/** Accepts a code from the current, previous, or next 30s window (clock drift tolerance). */
export function verifyTotpCode(secret: string, code: string, at: number = Date.now()): boolean {
  const cleanCode = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanCode)) return false;

  const counter = Math.floor(at / 1000 / STEP_SECONDS);
  for (let errorWindow = -WINDOW; errorWindow <= WINDOW; errorWindow++) {
    if (hotp(secret, counter + errorWindow) === cleanCode) return true;
  }
  return false;
}

export function buildTotpProvisioningUri(secret: string, email: string): string {
  const label = encodeURIComponent(`NEXFORM:${email}`);
  const issuer = encodeURIComponent("NEXFORM");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${CODE_DIGITS}&period=${STEP_SECONDS}`;
}
