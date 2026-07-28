import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { db } from "@/lib/db";
import { listCategories } from "@/features/categories/categories.repository";
import { getSeoMetaAction } from "@/features/seo/seo.actions";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ContentForm } from "@/components/admin/content-form";
import { TranslationStatus } from "@/components/admin/translation-status";

export const metadata: Metadata = { title: "Edit Content" };
export const dynamic = "force-dynamic";

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("content:update");
  const { id } = await params;

  const content = await db.content.findUnique({ where: { id }, include: { coverImage: true } });
  if (!content) notFound();

  const [categories, seo, siblings] = await Promise.all([
    listCategories("ARTICLE"),
    getSeoMetaAction("Content", id),
    db.content.findMany({
      where: { translationGroupId: content.translationGroupId },
      select: { id: true, language: true },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader title={content.title} description={`Editing ${content.contentType.toLowerCase()}`} />

      <div className="mb-6">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Translations</p>
        <TranslationStatus
          siblings={siblings}
          editBasePath="/admin/content"
          createHref={(lang) => `/admin/content/new?translationGroupId=${content.translationGroupId}&language=${lang}`}
        />
      </div>

      <ContentForm
        initialData={{
          id: content.id,
          contentType: content.contentType,
          slug: content.slug,
          title: content.title,
          excerpt: content.excerpt ?? "",
          body: content.body,
          language: content.language,
          translationGroupId: content.translationGroupId,
          categoryId: content.categoryId,
          coverImage: content.coverImage ? { id: content.coverImage.id, url: content.coverImage.url } : null,
          status: content.status,
          seo: seo
            ? {
                title: seo.title ?? "",
                description: seo.description ?? "",
                canonicalUrl: seo.canonicalUrl ?? "",
                robots: seo.robots ?? "",
                noIndex: seo.noIndex,
              }
            : { title: "", description: "", canonicalUrl: "", robots: "", noIndex: false },
        }}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
