"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeRichText } from "@/lib/security/sanitize";

/**
 * Intentionally simple V1: a sanitized-HTML textarea with a live preview, not a full
 * WYSIWYG toolbar. Content is sanitized here for preview AND authoritatively again on
 * the server before persisting — never trust client-sanitized HTML alone.
 */
export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 12,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <Tabs defaultValue="write">
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="font-mono text-sm"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Supports basic HTML: p, strong, em, a, ul/ol/li, h2–h4, blockquote, img. Anything else is stripped on save.
        </p>
      </TabsContent>
      <TabsContent value="preview">
        <div
          className="prose prose-sm dark:prose-invert min-h-40 max-w-none rounded-lg border border-border p-4"
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
        />
      </TabsContent>
    </Tabs>
  );
}
