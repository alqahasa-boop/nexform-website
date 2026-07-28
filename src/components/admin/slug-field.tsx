"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Auto-fills from `sourceValue` (usually the title) until the user edits the slug directly. */
export function SlugField({
  id,
  value,
  onChange,
  sourceValue,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  sourceValue: string;
}) {
  const [touched, setTouched] = useState(Boolean(value));

  useEffect(() => {
    if (!touched && sourceValue) {
      const next = slugify(sourceValue);
      if (next !== value) onChange(next);
    }
    // Only re-derive when the source (title) or touched-state changes — `value`/`onChange`
    // intentionally excluded to avoid re-running on every keystroke in the slug field itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceValue, touched]);

  return (
    <div className="flex gap-2">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          setTouched(true);
          onChange(slugify(e.target.value));
        }}
        dir="ltr"
        className="font-mono text-sm"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Regenerate slug from title"
        onClick={() => {
          setTouched(false);
          onChange(slugify(sourceValue));
        }}
      >
        <RefreshCw className="size-4" />
      </Button>
    </div>
  );
}
