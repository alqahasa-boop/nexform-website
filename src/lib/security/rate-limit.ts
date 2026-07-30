/**
 * In-memory sliding-window rate limiter. Good enough for a single Node
 * process (dev, small deployments); swap the `store` for a Redis-backed
 * implementation behind this same interface once running multi-instance —
 * nothing calling `rateLimit()` needs to change.
 */
interface RateLimitStore {
  hits: number[];
}

const store = new Map<string, RateLimitStore>();

export interface RateLimitOptions {
  /** Unique key per limited action, e.g. `login:${ip}` or `contact-form:${ip}`. */
  key: string;
  /** Max requests allowed inside the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  const entry = store.get(key) ?? { hits: [] };
  entry.hits = entry.hits.filter((timestamp) => timestamp > windowStart);

  const allowed = entry.hits.length < limit;
  if (allowed) entry.hits.push(now);

  store.set(key, entry);

  return {
    allowed,
    remaining: Math.max(0, limit - entry.hits.length),
    resetAt: (entry.hits[0] ?? now) + windowMs,
  };
}

/** Common presets so callers don't invent inconsistent limits ad hoc. */
export const RATE_LIMIT_PRESETS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 },
  passwordReset: { limit: 3, windowMs: 60 * 60 * 1000 },
  contactForm: { limit: 5, windowMs: 60 * 60 * 1000 },
  designRequestForm: { limit: 5, windowMs: 60 * 60 * 1000 },
  upload: { limit: 30, windowMs: 60 * 1000 },
  // AI presets are deliberately tighter than the general `upload` preset — every
  // AI call has a real per-request cost against the configured provider.
  aiChat: { limit: 20, windowMs: 5 * 60 * 1000 },
  aiVision: { limit: 10, windowMs: 5 * 60 * 1000 },
  aiDocumentUpload: { limit: 10, windowMs: 10 * 60 * 1000 },
  aiSearch: { limit: 30, windowMs: 60 * 1000 },
  aiMatching: { limit: 20, windowMs: 5 * 60 * 1000 },
  aiConcept: { limit: 10, windowMs: 10 * 60 * 1000 },
} as const;
