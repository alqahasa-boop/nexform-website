"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { SlugField } from "@/components/admin/slug-field";
import { MediaPicker } from "@/components/admin/media-picker";
import { createProjectAction, updateProjectAction } from "@/features/projects/projects.actions";

export interface ProjectData {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  location: string | null;
  coverImage: { id: string; url: string } | null;
}

export function ProjectDialog({ project }: { project?: ProjectData }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [location, setLocation] = useState(project?.location ?? "");
  const [coverImage, setCoverImage] = useState<{ id: string; url: string } | null>(project?.coverImage ?? null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = { title, slug, summary: summary || undefined, location: location || undefined, coverImageId: coverImage?.id };
      const result = project ? await updateProjectAction(project.id, payload) : await createProjectAction(payload);
      if (result.success) {
        toast.success(project ? "Project updated." : "Project created.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={project ? <Button size="icon-sm" variant="ghost" aria-label="Edit" /> : <Button />} nativeButton={true}>
        {project ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" />
            New Project
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "New Project"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Title" required htmlFor="project-title">
            <Input id="project-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Slug" required htmlFor="project-slug">
            <SlugField id="project-slug" value={slug} onChange={setSlug} sourceValue={title} />
          </FormField>
          <FormField label="Location" htmlFor="project-location">
            <Input id="project-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </FormField>
          <FormField label="Summary">
            <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
          </FormField>
          <FormField label="Cover Image">
            <MediaPicker value={coverImage} onChange={setCoverImage} />
          </FormField>
          <Button onClick={handleSubmit} disabled={isPending || !title || !slug}>
            {isPending && <Loader2 className="animate-spin" />}
            {project ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
