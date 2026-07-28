"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FormField } from "./form-field";
import { SlugField } from "./slug-field";
import { RichTextEditor } from "./rich-text-editor";
import { MediaPicker } from "./media-picker";
import { PublishControls } from "./publish-controls";
import { SeoEditor, emptySeoValue, type SeoEditorValue } from "./seo-editor";
import { UnsavedChangesBanner } from "./unsaved-changes-warning";
import { createContentAction, updateContentAction, publishContentAction, archiveContentAction } from "@/features/content/content.actions";

interface CategoryOption {
  id: string;
  name: string;
}

export interface ContentFormInitialData {
  id: string;
  contentType: "ARTICLE" | "PAGE";
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  language: string;
  translationGroupId: string;
  categoryId: string | null;
  coverImage: { id: string; url: string } | null;
  status: string;
  seo: SeoEditorValue;
}

export function ContentForm({
  initialData,
  categories,
}: {
  initialData: ContentFormInitialData | null;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [contentType, setContentType] = useState(initialData?.contentType ?? "ARTICLE");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "en");
  const [categoryId, setCategoryId] = useState<string | null>(initialData?.categoryId ?? null);
  const [coverImage, setCoverImage] = useState<{ id: string; url: string } | null>(initialData?.coverImage ?? null);
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  const markDirty = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setIsDirty(true);
  };

  const buildPayload = () => ({
    contentType,
    slug,
    title,
    excerpt: excerpt || undefined,
    body,
    language,
    categoryId: categoryId ?? undefined,
    coverImageId: coverImage?.id ?? undefined,
  });

  const handleSave = () => {
    startTransition(async () => {
      if (initialData) {
        const result = await updateContentAction(initialData.id, buildPayload());
        if (result.success) {
          toast.success("Content saved.");
          setIsDirty(false);
          router.refresh();
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createContentAction(buildPayload());
        if (result.success) {
          toast.success("Content created.");
          router.push(`/admin/content/${result.data.id}`);
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  return (
    <div>
      <UnsavedChangesBanner isDirty={isDirty} />

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Type" required>
              <Select value={contentType} onValueChange={(v) => v && markDirty(setContentType)(v as "ARTICLE" | "PAGE")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ARTICLE">Article</SelectItem>
                  <SelectItem value="PAGE">Page</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Language" required>
              <Select value={language} onValueChange={(v) => v && markDirty(setLanguage)(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormField label="Title" required htmlFor="content-title">
            <Input id="content-title" value={title} onChange={(e) => markDirty(setTitle)(e.target.value)} />
          </FormField>

          <FormField label="Slug" required htmlFor="content-slug" hint="Auto-generated from the title until edited manually.">
            <SlugField id="content-slug" value={slug} onChange={markDirty(setSlug)} sourceValue={title} />
          </FormField>

          <FormField label="Category">
            <Select value={categoryId ?? "none"} onValueChange={(v) => markDirty(setCategoryId)(v === "none" ? null : v)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Excerpt" htmlFor="content-excerpt" hint="Short summary shown in listings.">
            <Textarea id="content-excerpt" rows={2} value={excerpt} onChange={(e) => markDirty(setExcerpt)(e.target.value)} />
          </FormField>

          <FormField label="Cover Image">
            <MediaPicker value={coverImage} onChange={markDirty(setCoverImage)} />
          </FormField>

          <FormField label="Body" required htmlFor="content-body">
            <RichTextEditor id="content-body" value={body} onChange={markDirty(setBody)} />
          </FormField>

          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={isPending || !title || !slug || !body}>
              {isPending && <Loader2 className="animate-spin" />}
              {initialData ? "Save Changes" : "Create Content"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <SeoEditor entityType="Content" entityId={initialData?.id ?? null} initialValue={initialData?.seo ?? emptySeoValue} />
        </TabsContent>
      </Tabs>

      {initialData && (
        <div className="mt-6">
          <PublishControls
            status={initialData.status}
            onSaveDraft={() => updateContentAction(initialData.id, { status: "DRAFT" })}
            onPublish={() => publishContentAction(initialData.id)}
            onArchive={() => archiveContentAction(initialData.id)}
            onSuccess={() => router.refresh()}
          />
        </div>
      )}
    </div>
  );
}
