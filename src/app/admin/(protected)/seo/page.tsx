import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listRedirects } from "@/features/redirects/redirects.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/admin/empty-state";
import { RedirectForm } from "./redirect-form";
import { RedirectRow } from "./redirect-row";
import { ArrowRightLeft } from "lucide-react";

export const metadata: Metadata = { title: "SEO" };
export const dynamic = "force-dynamic";

export default async function SeoPage() {
  await requirePermission("seo:view");
  const redirects = await listRedirects();

  return (
    <div>
      <AdminPageHeader
        title="SEO"
        description="Per-page meta titles, descriptions, and canonical URLs are edited from each item's own edit screen (Content, Companies, ...). This page manages sitewide redirects."
      />

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Redirects</h2>
        <RedirectForm />
        <div className="mt-4">
          {redirects.length === 0 ? (
            <EmptyState icon={ArrowRightLeft} title="No redirects configured" className="py-8" />
          ) : (
            redirects.map((r) => <RedirectRow key={r.id} id={r.id} fromPath={r.fromPath} toPath={r.toPath} statusCode={r.statusCode} />)
          )}
        </div>
      </section>
    </div>
  );
}
