import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listPackages } from "@/features/advertisements/advertisements.repository";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CampaignForm } from "./campaign-form";

export const metadata: Metadata = { title: "New Campaign" };
export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  await requirePermission("advertisements:create");
  const [packages, companies] = await Promise.all([
    listPackages(),
    db.company.findMany({ where: { approvalStatus: "APPROVED" }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <AdminPageHeader title="New Campaign" description="Create an advertising campaign for a company." />
      <CampaignForm companies={companies} packages={packages.map((p) => ({ id: p.id, name: p.name }))} />
    </div>
  );
}
