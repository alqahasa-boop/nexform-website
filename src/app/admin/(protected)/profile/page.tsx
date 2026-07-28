import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getUserById } from "@/features/users/users.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { UserAvatar } from "@/components/admin/user-avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireAdminSession();
  const user = await getUserById(session.id);
  if (!user) return null;

  return (
    <div>
      <AdminPageHeader title="My Profile" description="Manage your NEXFORM admin account." />

      <div className="mb-6 flex items-center gap-4">
        <UserAvatar name={user.name} email={user.email} image={user.image} className="size-14" />
        <div>
          <p className="text-lg font-medium">{user.name ?? user.email}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-1 flex gap-1">
            {user.roles.map((ur) => (
              <Badge key={ur.roleId} variant="secondary">
                {ur.role.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <ProfileForm initialName={user.name ?? ""} />
    </div>
  );
}
