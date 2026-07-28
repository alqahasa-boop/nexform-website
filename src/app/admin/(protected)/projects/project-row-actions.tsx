"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/admin/confirmation-dialog";
import { publishProjectAction, deleteProjectAction } from "@/features/projects/projects.actions";
import { ProjectDialog, type ProjectData } from "./project-dialog";

export function ProjectRowActions({ project }: { project: ProjectData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-1">
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="Publish"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await publishProjectAction(project.id);
            if (result.success) router.refresh();
            else toast.error(result.error);
          })
        }
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      </Button>
      <ProjectDialog project={project} />
      <ConfirmationDialog
        title="Delete this project?"
        description="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => deleteProjectAction(project.id)}
        onSuccess={() => router.refresh()}
        trigger={
          <Button size="icon-sm" variant="ghost" aria-label="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        }
      />
    </div>
  );
}
