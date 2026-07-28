import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { getDesignRequestById } from "@/features/design-requests/design-requests.repository";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { StatusControl } from "./status-control";
import { AssignControl, PriorityControl } from "./assign-control";
import { DesignRequestNotes } from "./notes";

export const metadata: Metadata = { title: "Design Request" };
export const dynamic = "force-dynamic";

export default async function DesignRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("designRequests:view");
  const { id } = await params;

  const [request, staff] = await Promise.all([
    getDesignRequestById(id),
    db.user.findMany({ where: { roles: { some: {} } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  if (!request) notFound();

  return (
    <div>
      <AdminPageHeader
        title={request.requestNumber}
        description={`Submitted by ${request.fullName} · ${request.email}${request.phone ? ` · ${request.phone}` : ""}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Request Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Service</dt>
                <dd>{request.service?.title ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Property Type</dt>
                <dd>{request.propertyType ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Room Type</dt>
                <dd>{request.roomType ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Budget Range</dt>
                <dd>
                  {request.budgetMin || request.budgetMax
                    ? `${request.budgetMin ?? "?"} – ${request.budgetMax ?? "?"} KWD`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Preferred Styles</dt>
                <dd>{request.preferredStyles.map((s) => s.style.name).join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Received</dt>
                <dd>{request.createdAt.toLocaleDateString()}</dd>
              </div>
            </dl>
            {request.notes && (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm">Customer Notes</p>
                <p className="mt-1 text-sm">{request.notes}</p>
              </div>
            )}
          </section>

          {request.images.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Images</h2>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {request.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={img.id} src={img.mediaAsset.url} alt={img.role} className="aspect-square rounded-lg border border-border object-cover" />
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Messages & Internal Notes</h2>
            <DesignRequestNotes
              designRequestId={request.id}
              messages={request.messages.map((m) => ({
                id: m.id,
                body: m.body,
                isInternal: m.isInternal,
                authorName: m.authorName,
                createdAt: m.createdAt,
              }))}
            />
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Status History</h2>
            <ActivityTimeline
              entries={request.statusHistory.map((h) => ({
                id: h.id,
                action: h.toStatus,
                entityType: "DesignRequest",
                createdAt: h.createdAt,
                note: h.note,
              }))}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Status</h2>
            <div className="mb-3">
              <StatusBadge status={request.status} />
            </div>
            <StatusControl id={request.id} currentStatus={request.status} />
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Assigned Designer</h2>
            <AssignControl id={request.id} assignedToId={request.assignedToId} staff={staff} />
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Priority</h2>
            <PriorityControl id={request.id} priority={request.priority} />
          </section>
        </div>
      </div>
    </div>
  );
}
