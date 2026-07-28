"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "@/components/admin/form-field";
import { SlugField } from "@/components/admin/slug-field";
import { createLibraryCategoryAction } from "@/features/construction-library/construction-library.actions";

export function CategoryDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createLibraryCategoryAction({ name, slug });
      if (result.success) {
        toast.success("Category created.");
        setOpen(false);
        setName("");
        setSlug("");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />} nativeButton={true}>
        <Plus className="size-4" />
        New Category
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Library Category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Name" required htmlFor="cat-name">
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Slug" required htmlFor="cat-slug">
            <SlugField id="cat-slug" value={slug} onChange={setSlug} sourceValue={name} />
          </FormField>
          <Button onClick={handleSubmit} disabled={isPending || !name || !slug}>
            {isPending && <Loader2 className="animate-spin" />}
            Create Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
