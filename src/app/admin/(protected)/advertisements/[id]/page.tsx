import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { CampaignStatusActions } from "./campaign-status-actions";
import { AddCreativeForm } from "./add-creative-form";

export const metadata: Metadata = { title: "Manage Campaign" };
export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("advertisements:view");
  const { id } = await params;

  const campaign = await db.advertisementCampaign.findUnique({
    where: { id },
    include: { company: true, package: true, creatives: { include: { image: true } } },
  });
  if (!campaign) notFound();

  return (
    <div>
      <AdminPageHeader
        title={campaign.name}
        description={`Advertiser: ${campaign.company.name}${campaign.package ? ` · Package: ${campaign.package.name}` : ""}`}
        actions={<StatusBadge status={campaign.status} />}
      />

      {campaign.rejectionReason && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Rejected: {campaign.rejectionReason}
        </div>
      )}

      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Campaign Status</h2>
        <CampaignStatusActions id={campaign.id} status={campaign.status} />
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold">Creatives</h2>
        {campaign.creatives.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">No creatives yet — add one below.</p>
        ) : (
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {campaign.creatives.map((creative) => {
              const ctr = creative.impressionCount > 0 ? ((creative.clickCount / creative.impressionCount) * 100).toFixed(2) : "0.00";
              return (
                <div key={creative.id} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{creative.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {creative.impressionCount} impressions · {creative.clickCount} clicks · {ctr}% CTR
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <AddCreativeForm campaignId={campaign.id} />
      </div>
    </div>
  );
}
