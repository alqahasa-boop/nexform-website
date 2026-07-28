import sanitizeHtml from "sanitize-html";

/**
 * Real HTML sanitizer for rich-text fields (Content.body, ConstructionJourneyStage.richContent,
 * DesignIdea.description, ...). Every admin write path must call this before persisting HTML,
 * and the public renderer must never trust stored HTML without this having already run.
 *
 * Uses `sanitize-html` (pure JS, no jsdom) rather than a DOMPurify+jsdom combo — jsdom's
 * dependency tree requires an ESM-only package directly via require(), which breaks under
 * Vercel's Turbopack-bundled server runtime (works locally via plain Node, fails in production).
 */
const ALLOWED_RICH_TEXT_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption", "code", "pre", "hr", "span",
];

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_RICH_TEXT_TAGS,
    allowedAttributes: {
      "*": ["class"],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

/**
 * Minimal XSS-safe escaping for plain-text fields rendered as HTML.
 */
const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/** Trims and collapses internal whitespace — apply to every free-text form field before validation. */
export function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
