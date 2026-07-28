"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { FormField } from "./form-field";
import { upsertSeoMetaAction } from "@/features/seo/seo.actions";

export interface SeoEditorValue {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  noIndex: boolean;
}

export const emptySeoValue: SeoEditorValue = { title: "", description: "", canonicalUrl: "", robots: "", noIndex: false };

export function SeoEditor({
  entityType,
  entityId,
  initialValue,
}: {
  entityType: string;
  entityId: string | null;
  initialValue: SeoEditorValue;
}) {
  const [value, setValue] = useState(initialValue);
  const [isPending, startTransition] = useTransition();

  if (!entityId) {
    return <p className="text-sm text-muted-foreground">Save this item first to configure its SEO metadata.</p>;
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await upsertSeoMetaAction({
        entityType,
        entityId,
        title: value.title || undefined,
        description: value.description || undefined,
        canonicalUrl: value.canonicalUrl || undefined,
        robots: value.robots || undefined,
        noIndex: value.noIndex,
      });
      if (result.success) toast.success("SEO settings saved.");
      else toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      <FormField label="Meta Title" hint={`${value.title.length}/60 characters recommended`}>
        <Input value={value.title} maxLength={70} onChange={(e) => setValue((v) => ({ ...v, title: e.target.value }))} />
      </FormField>
      <FormField label="Meta Description" hint={`${value.description.length}/160 characters recommended`}>
        <Textarea
          value={value.description}
          maxLength={300}
          rows={3}
          onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
        />
      </FormField>
      <FormField label="Canonical URL">
        <Input
          type="url"
          dir="ltr"
          value={value.canonicalUrl}
          onChange={(e) => setValue((v) => ({ ...v, canonicalUrl: e.target.value }))}
          placeholder="https://nexform.com/..."
        />
      </FormField>
      <div className="flex items-center gap-2">
        <Switch id="seo-noindex" checked={value.noIndex} onCheckedChange={(checked) => setValue((v) => ({ ...v, noIndex: checked === true }))} />
        <Label htmlFor="seo-noindex">Hide from search engines (noindex)</Label>
      </div>
      <Button type="button" size="sm" onClick={handleSave} disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Save SEO Settings
      </Button>
    </div>
  );
}
