import type { Metadata } from "next";
import { requireCustomerSession } from "@/lib/auth/customer-session";
import { getCustomerAccount } from "@/features/customers/customers.repository";
import { listSavedDesignIdeasByUser } from "@/features/design-ideas/design-ideas.repository";
import { listDesignRequestsByCustomer } from "@/features/design-requests/design-requests.repository";
import { customerLogoutAction } from "@/features/customers/customers.actions";
import { DashboardCopy } from "./dashboard-copy";

export const metadata: Metadata = { title: "My Account" };

export default async function CustomerDashboardPage() {
  const session = await requireCustomerSession();
  const [account, saves, requests] = await Promise.all([
    getCustomerAccount(session.id),
    listSavedDesignIdeasByUser(session.id),
    listDesignRequestsByCustomer(session.id),
  ]);

  const savedDesigns = saves.map((s) => ({
    slug: s.designIdea.slug,
    language: s.designIdea.language,
    title: s.designIdea.title,
    category: s.designIdea.category?.name ?? null,
    coverImageUrl: s.designIdea.coverImage?.url ?? null,
  }));

  const designRequests = requests.map((r) => ({
    id: r.id,
    requestNumber: r.requestNumber,
    status: r.status,
    serviceName: r.service?.title ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:pt-32">
      <DashboardCopy
        name={account?.name}
        email={account?.email ?? session.email}
        savedDesigns={savedDesigns}
        designRequests={designRequests}
        logoutAction={customerLogoutAction}
      />
    </div>
  );
}
