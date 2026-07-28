import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listCategories } from "@/features/categories/categories.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ContentForm } from "@/components/admin/content-form";

export const metadata: Metadata = { title: "New Content" };
export const dynamic = "force-dynamic";

export default async function NewContentPage() {
  await requirePermission("content:create");
  const categories = await listCategories("ARTICLE");

  return (
    <div>
      <AdminPageHeader title="New Content" description="Create a new article or page." />
      <ContentForm initialData={null} categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </div>
  );
}
