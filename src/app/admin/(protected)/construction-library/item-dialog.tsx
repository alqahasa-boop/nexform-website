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
import { FilePicker } from "@/components/admin/file-picker";
import { createLibraryItemAction, updateLibraryItemAction } from "@/features/construction-library/construction-library.actions";

interface CategoryOption {
  id: string;
  name: string;
}

export interface LibraryItemData {
  id: string;
  title: string;
  description: string | null;
  categoryId: string;
  sourceOrganization: string | null;
  sourceUrl: string | null;
  isVerified: boolean;
  file: { id: string; fileName: string } | null;
}

const DOCUMENT_TYPES = ["GOVERNMENT", "BANK_FINANCE", "PDF_GUIDE", "ENGINEERING_MANUAL", "CHECKLIST", "FORM", "REGULATION", "OTHER"];

export function ItemDialog({ item, categories }: { item?: LibraryItemData; categories: CategoryOption[] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(item?.title ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(item?.categoryId ?? categories[0]?.id ?? null);
  const [documentType, setDocumentType] = useState("OTHER");
  const [sourceOrganization, setSourceOrganization] = useState(item?.sourceOrganization ?? "");
  const [sourceUrl, setSourceUrl] = useState(item?.sourceUrl ?? "");
  const [file, setFile] = useState<{ id: string; fileName: string } | null>(item?.file ?? null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!categoryId) {
      toast.error("Select a category.");
      return;
    }
    startTransition(async () => {
      const payload = {
        title,
        description: description || undefined,
        categoryId,
        documentType,
        fileId: file?.id,
        sourceOrganization: sourceOrganization || undefined,
        sourceUrl: sourceUrl || undefined,
      };
      const result = item ? await updateLibraryItemAction(item.id, payload) : await createLibraryItemAction(payload);
      if (result.success) {
        toast.success(item ? "Document updated." : "Document created.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={item ? <Button size="icon-sm" variant="ghost" aria-label="Edit" /> : <Button />} nativeButton={true}>
        {item ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" />
            New Document
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Document" : "New Document"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Title" required htmlFor="item-title">
            <Input id="item-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Description" htmlFor="item-description">
            <Textarea id="item-description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <Select value={categoryId ?? undefined} onValueChange={(v) => setCategoryId(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Document Type">
              <Select value={documentType} onValueChange={(v) => v && setDocumentType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
          <FormField label="File">
            <FilePicker value={file} onChange={setFile} />
          </FormField>
          <FormField label="Source Organization" hint="Required to mark a document as officially verified.">
            <Input value={sourceOrganization} onChange={(e) => setSourceOrganization(e.target.value)} />
          </FormField>
          <FormField label="Source URL">
            <Input type="url" dir="ltr" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
          </FormField>
          <Button onClick={handleSubmit} disabled={isPending || !title || !categoryId}>
            {isPending && <Loader2 className="animate-spin" />}
            {item ? "Save Changes" : "Create Document"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
