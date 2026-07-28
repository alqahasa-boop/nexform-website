import DOMPurify from "isomorphic-dompurify";

/**
 * Real HTML sanitizer for rich-text fields (Content.body, ConstructionJourneyStage.richContent,
 * DesignIdea.description, ...). Every admin write path must call this before persisting HTML,
 * and the public renderer must never trust stored HTML without this having already run.
 */
const ALLOWED_RICH_TEXT_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
  "h2", "h3", "h4", "blockquote", "img", "figure", "figcaption", "code", "pre", "hr", "span",
];

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ALLOWED_RICH_TEXT_TAGS,
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
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
