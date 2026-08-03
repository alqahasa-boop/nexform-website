import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { AuthenticatedUser } from "@/types/rbac";

/**
 * Session helpers for the public customer account area (`/customer/**`),
 * parallel to `admin-session.ts` but redirecting to the customer sign-in
 * page instead of the staff one. Any authenticated user can hold a customer
 * session — there is no permission gate here, only "is anyone signed in,"
 * since `/customer/**` pages only ever read/write the signed-in user's own
 * data (profile, saved designs, submitted requests).
 */
export async function getCustomerSession(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user) return null;

  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    roleKeys: session.user.roleKeys,
    permissions: session.user.permissions,
  };
}

/** Server Component guard — redirects unauthenticated visitors to /customer/login. */
export async function requireCustomerSession(): Promise<AuthenticatedUser> {
  const user = await getCustomerSession();
  if (!user) redirect("/customer/login");
  return user;
}
