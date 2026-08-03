"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, FolderPlus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { createFolderAction } from "@/features/media/media.actions";

export function NewFolderDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createFolderAction({ name });
      if (result.success) {
        toast.success("Folder created.");
        setOpen(false);
        setName("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />} nativeButton={true}>
        <FolderPlus className="size-4" />
        New Folder
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Name" required htmlFor="folder-name">
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name && handleSubmit()}
            />
          </FormField>
          <Button onClick={handleSubmit} disabled={isPending || !name}>
            {isPending && <Loader2 className="animate-spin" />}
            Create Folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
