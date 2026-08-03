"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Folder, FolderOpen, Images, Pencil, Trash2, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { renameFolderAction, deleteFolderAction } from "@/features/media/media.actions";
import { NewFolderDialog } from "./new-folder-dialog";
import { cn } from "@/lib/utils";

export interface FolderSummary {
  id: string;
  name: string;
  assetCount: number;
}

export function MediaFolderSidebar({
  folders,
  rootCount,
  activeFolderId,
}: {
  folders: FolderSummary[];
  rootCount: number;
  activeFolderId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToFolder = (folderId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (folderId) params.set("folderId", folderId);
    else params.delete("folderId");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full shrink-0 space-y-3 sm:w-56">
      <div className="flex items-center justify-between">
        <p className="px-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground/70">Folders</p>
        <NewFolderDialog />
      </div>

      <nav className="space-y-0.5">
        <button
          type="button"
          onClick={() => goToFolder(null)}
          className={cn(
            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
            activeFolderId === null ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Images className="size-4 shrink-0" />
          <span className="flex-1 truncate">All Files</span>
          <span className="text-xs text-muted-foreground/70">{rootCount}</span>
        </button>

        {folders.map((folder) => (
          <FolderRow key={folder.id} folder={folder} active={activeFolderId === folder.id} onSelect={() => goToFolder(folder.id)} />
        ))}
      </nav>
    </div>
  );
}

function FolderRow({ folder, active, onSelect }: { folder: FolderSummary; active: boolean; onSelect: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [isPending, startTransition] = useTransition();

  const handleRename = () => {
    if (!name.trim() || name === folder.name) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const result = await renameFolderAction(folder.id, { name: name.trim() });
      if (result.success) {
        setEditing(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFolderAction(folder.id);
      if (result.success) {
        toast.success("Folder deleted.");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-lg px-2 py-1.5">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setEditing(false);
          }}
          className="min-w-0 flex-1 rounded border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:border-ring"
        />
        <button onClick={handleRename} disabled={isPending} aria-label="Save" className="p-1 text-muted-foreground hover:text-foreground">
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
        </button>
        <button onClick={() => setEditing(false)} aria-label="Cancel" className="p-1 text-muted-foreground hover:text-foreground">
          <X className="size-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 items-center gap-2 text-start">
        {active ? <FolderOpen className="size-4 shrink-0" /> : <Folder className="size-4 shrink-0" />}
        <span className="flex-1 truncate">{folder.name}</span>
        <span className="text-xs text-muted-foreground/70">{folder.assetCount}</span>
      </button>
      <div className="hidden items-center gap-0.5 group-hover:flex">
        <button onClick={() => setEditing(true)} aria-label="Rename folder" className="p-1 hover:text-foreground">
          <Pencil className="size-3" />
        </button>
        <button onClick={handleDelete} disabled={isPending} aria-label="Delete folder" className="p-1 hover:text-destructive">
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  );
}
