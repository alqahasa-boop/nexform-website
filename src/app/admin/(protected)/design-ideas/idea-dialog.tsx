"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { SlugField } from "@/components/admin/slug-field";
import { MediaPicker } from "@/components/admin/media-picker";
import { createDesignIdeaAction, updateDesignIdeaAction } from "@/features/design-ideas/design-ideas.actions";

export interface DesignIdeaData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  designCategory: string;
  coverImage: { id: string; url: string } | null;
}

const CATEGORIES = ["GENERAL", "FACADE", "INTERIOR", "COMMERCIAL_BOOTH"];

export function IdeaDialog({ idea }: { idea?: DesignIdeaData }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(idea?.title ?? "");
  const [slug, setSlug] = useState(idea?.slug ?? "");
  const [description, setDescription] = useState(idea?.description ?? "");
  const [designCategory, setDesignCategory] = useState(idea?.designCategory ?? "GENERAL");
  const [coverImage, setCoverImage] = useState<{ id: string; url: string } | null>(idea?.coverImage ?? null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = { title, slug, description: description || undefined, designCategory, coverImageId: coverImage?.id };
      const result = idea ? await updateDesignIdeaAction(idea.id, payload) : await createDesignIdeaAction(payload);
      if (result.success) {
        toast.success(idea ? "Design idea updated." : "Design idea created.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={idea ? <Button size="icon-sm" variant="ghost" aria-label="Edit" /> : <Button />} nativeButton={true}>
        {idea ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" />
            New Design Idea
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{idea ? "Edit Design Idea" : "New Design Idea"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Title" required htmlFor="idea-title">
            <Input id="idea-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Slug" required htmlFor="idea-slug">
            <SlugField id="idea-slug" value={slug} onChange={setSlug} sourceValue={title} />
          </FormField>
          <FormField label="Category">
            <Select value={designCategory} onValueChange={(v) => v && setDesignCategory(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Description">
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <FormField label="Cover Image">
            <MediaPicker value={coverImage} onChange={setCoverImage} />
          </FormField>
          <Button onClick={handleSubmit} disabled={isPending || !title || !slug}>
            {isPending && <Loader2 className="animate-spin" />}
            {idea ? "Save Changes" : "Create Design Idea"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
