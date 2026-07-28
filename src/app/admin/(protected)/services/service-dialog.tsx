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
import { createServiceAction, updateServiceAction } from "@/features/services/services.actions";

export interface ServiceData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  pricingDisplay: string;
  price: unknown;
}

const PRICING_OPTIONS = ["CONTACT_FOR_QUOTE", "STARTING_AT", "FIXED", "HIDDEN"];

export function ServiceDialog({ service }: { service?: ServiceData }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(service?.title ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [pricingDisplay, setPricingDisplay] = useState(service?.pricingDisplay ?? "CONTACT_FOR_QUOTE");
  const [price, setPrice] = useState(service?.price ? String(service.price) : "");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const needsPrice = pricingDisplay === "FIXED" || pricingDisplay === "STARTING_AT";

  const handleSubmit = () => {
    startTransition(async () => {
      const payload = {
        title,
        slug,
        description: description || undefined,
        pricingDisplay,
        price: needsPrice && price ? Number(price) : undefined,
      };
      const result = service ? await updateServiceAction(service.id, payload) : await createServiceAction(payload);
      if (result.success) {
        toast.success(service ? "Service updated." : "Service created.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={service ? <Button size="icon-sm" variant="ghost" aria-label="Edit" /> : <Button />} nativeButton={true}>
        {service ? <Pencil className="size-4" /> : (
          <>
            <Plus className="size-4" />
            New Service
          </>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "New Service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Title" required htmlFor="service-title">
            <Input id="service-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Slug" required htmlFor="service-slug">
            <SlugField id="service-slug" value={slug} onChange={setSlug} sourceValue={title} />
          </FormField>
          <FormField label="Description">
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Pricing Display">
              <Select value={pricingDisplay} onValueChange={(v) => v && setPricingDisplay(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            {needsPrice && (
              <FormField label="Price (KWD)" htmlFor="service-price">
                <Input id="service-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </FormField>
            )}
          </div>
          <Button onClick={handleSubmit} disabled={isPending || !title || !slug}>
            {isPending && <Loader2 className="animate-spin" />}
            {service ? "Save Changes" : "Create Service"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
