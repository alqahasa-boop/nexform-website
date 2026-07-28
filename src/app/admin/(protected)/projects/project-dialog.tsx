"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Pencil } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  clientName?: string | null;
  videoUrl?: string | null;
  featured?: boolean;
  styleId?: string | null;
}

export function ProjectDialog({ project, styles = [] }: { project?: ProjectData; styles?: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [location, setLocation] = useState(project?.location ?? "");
  const [coverImage, setCoverImage] = useState<{ id: string; url: string } | null>(project?.coverImage ?? null);
  const [clientName, setClientName] = useState(project?.clientName ?? "");
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [styleId, setStyleId] = useState(project?.styleId ?? "none");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = {
        title,
        slug,
        summary: summary || undefined,
        location: location || undefined,
        coverImageId: coverImage?.id,
        clientName: clientName || undefined,
        videoUrl: videoUrl || undefined,
        featured,
        styleId: styleId === "none" ? undefined : styleId,
      };
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
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client" htmlFor="project-client">
              <Input id="project-client" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </FormField>
            <FormField label="Style">
              <Select value={styleId} onValueChange={(v) => v && setStyleId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No style</SelectItem>
                  {styles.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="Video URL" htmlFor="project-video" hint="YouTube/Vimeo link shown on the project's public page.">
            <Input id="project-video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://…" />
          </FormField>
          <div className="flex items-center gap-2">
            <Switch id="project-featured" checked={featured} onCheckedChange={(v) => setFeatured(v === true)} />
            <Label htmlFor="project-featured">Featured</Label>
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !title || !slug}>
            {isPending && <Loader2 className="animate-spin" />}
            {project ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
