import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGUAGES } from "@/config/languages.config";

export interface TranslationSibling {
  language: string;
  id: string;
}

/**
 * Shows which of the site's supported languages already have a sibling row for this
 * `translationGroupId`, and links to create the missing ones. Editing happens on each
 * language's own row (Phase 2 keeps row-per-locale content) — this is a completeness
 * indicator, not an inline dual-language editor.
 */
export function TranslationStatus({
  siblings,
  editBasePath,
  createHref,
}: {
  siblings: TranslationSibling[];
  editBasePath: string;
  createHref: (language: string) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUPPORTED_LANGUAGES.map((lang) => {
        const sibling = siblings.find((s) => s.language === lang.code);
        return sibling ? (
          <Link key={lang.code} href={`${editBasePath}/${sibling.id}`}>
            <Badge variant="default" className="gap-1">
              <Check className="size-3" />
              {lang.nativeName}
            </Badge>
          </Link>
        ) : (
          <Link key={lang.code} href={createHref(lang.code)}>
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Plus className="size-3" />
              {lang.nativeName}
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}
