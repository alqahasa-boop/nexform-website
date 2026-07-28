"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormField } from "./form-field";
import { SlugField } from "./slug-field";
import { MediaPicker } from "./media-picker";
import { createCompanyAction, updateCompanyAction } from "@/features/companies/companies.actions";

interface CategoryOption {
  id: string;
  name: string;
}

export interface CompanyFormInitialData {
  id: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  whatsapp: string;
  phone: string;
  email: string;
  address: string;
  logo: { id: string; url: string } | null;
  categoryIds: string[];
}

export function CompanyForm({ initialData, categories }: { initialData: CompanyFormInitialData | null; categories: CategoryOption[] }) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [website, setWebsite] = useState(initialData?.website ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [email, setEmail] = useState(initialData?.email ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [logo, setLogo] = useState<{ id: string; url: string } | null>(initialData?.logo ?? null);
  const [categoryIds, setCategoryIds] = useState(new Set(initialData?.categoryIds ?? []));
  const [isPending, startTransition] = useTransition();

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const buildPayload = () => ({
    name,
    slug,
    description: description || undefined,
    website: website || undefined,
    whatsapp: whatsapp || undefined,
    phone: phone || undefined,
    email: email || undefined,
    address: address || undefined,
    logoId: logo?.id,
    categoryIds: Array.from(categoryIds),
  });

  const handleSubmit = () => {
    startTransition(async () => {
      const result = initialData
        ? await updateCompanyAction(initialData.id, buildPayload())
        : await createCompanyAction(buildPayload());

      if (result.success) {
        toast.success(initialData ? "Company updated." : "Company created.");
        router.push(initialData ? `/admin/companies/${initialData.id}` : `/admin/companies/${(result.data as { id: string }).id}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-5">
      <FormField label="Company Name" required htmlFor="company-name">
        <Input id="company-name" value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Slug" required htmlFor="company-slug">
        <SlugField id="company-slug" value={slug} onChange={setSlug} sourceValue={name} />
      </FormField>
      <FormField label="Description" htmlFor="company-description">
        <Textarea id="company-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </FormField>
      <FormField label="Logo">
        <MediaPicker value={logo} onChange={setLogo} />
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Website" htmlFor="company-website">
          <Input id="company-website" type="url" dir="ltr" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </FormField>
        <FormField label="WhatsApp" htmlFor="company-whatsapp">
          <Input id="company-whatsapp" dir="ltr" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
        </FormField>
        <FormField label="Phone" htmlFor="company-phone">
          <Input id="company-phone" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
        <FormField label="Email" htmlFor="company-email">
          <Input id="company-email" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
      </div>
      <FormField label="Address" htmlFor="company-address">
        <Input id="company-address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </FormField>
      <FormField label="Categories">
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-1.5 text-sm">
              <Checkbox checked={categoryIds.has(c.id)} onCheckedChange={() => toggleCategory(c.id)} />
              {c.name}
            </label>
          ))}
        </div>
      </FormField>
      <Button onClick={handleSubmit} disabled={isPending || !name || !slug}>
        {isPending && <Loader2 className="animate-spin" />}
        {initialData ? "Save Changes" : "Create Company"}
      </Button>
    </div>
  );
}
