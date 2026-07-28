import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/admin-session";
import { getContactMessageById, updateContactMessage } from "@/features/contact-messages/contact-messages.repository";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ReplyForm, StatusControl, AssignControl } from "./reply-form";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Contact Message" };
export const dynamic = "force-dynamic";

export default async function ContactMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("contactMessages:view");
  const { id } = await params;

  const [message, staff] = await Promise.all([
    getContactMessageById(id),
    db.user.findMany({ where: { roles: { some: {} } }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } }),
  ]);
  if (!message) notFound();

  if (!message.isRead) {
    await updateContactMessage(id, { isRead: true });
  }

  return (
    <div>
      <AdminPageHeader title={message.name} description={`${message.email}${message.phone ? ` · ${message.phone}` : ""}`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-2 text-sm font-semibold">Original Message</h2>
            <p className="whitespace-pre-wrap text-sm">{message.message}</p>
            <p className="mt-2 text-xs text-muted-foreground">{formatDistanceToNow(message.createdAt, { addSuffix: true })}</p>
          </section>

          {message.replies.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Replies</h2>
              <div className="space-y-3">
                {message.replies.map((r) => (
                  <div key={r.id} className="rounded-lg bg-muted/60 p-2.5">
                    <p className="text-sm">{r.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.repliedBy.name ?? r.repliedBy.email} · {formatDistanceToNow(r.sentAt, { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Reply</h2>
            <ReplyForm contactMessageId={message.id} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Status</h2>
            <StatusControl id={message.id} status={message.status} />
          </section>
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-sm font-semibold">Assigned To</h2>
            <AssignControl id={message.id} assignedToId={message.assignedToId} staff={staff} />
          </section>
        </div>
      </div>
    </div>
  );
}
