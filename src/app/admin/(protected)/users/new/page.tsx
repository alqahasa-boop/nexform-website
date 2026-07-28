import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listRoles } from "@/features/users/roles.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InviteUserForm } from "./invite-form";

export const metadata: Metadata = { title: "Invite User" };
export const dynamic = "force-dynamic";

export default async function InviteUserPage() {
  await requirePermission("users:create");
  const roles = await listRoles();

  return (
    <div>
      <AdminPageHeader
        title="Invite User"
        description="New admin accounts are created without a password — the user sets their own via an emailed link."
      />
      <InviteUserForm roles={roles.map((r) => ({ id: r.id, name: r.name }))} />
    </div>
  );
}
