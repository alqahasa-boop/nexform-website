import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye,
  Users,
  FileText,
  FilePenLine,
  Building2,
  Sparkles,
  Wrench,
  Route,
  Library,
  HelpCircle,
  ImageIcon,
  Download,
  Building,
  Megaphone,
  AlarmClock,
  ClipboardList,
  Mail,
  Plus,
} from "lucide-react";
import {
  getDashboardStats,
  getRecentDesignRequests,
  getRecentContactMessages,
  getRecentActivity,
} from "@/features/dashboard/dashboard.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/admin/status-badge";
import { EmptyState } from "@/components/admin/empty-state";
import { ActivityTimeline } from "@/components/admin/activity-timeline";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { resolveDateRange } from "@/lib/date-range";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = resolveDateRange(params);

  const [stats, recentRequests, recentMessages, recentActivity] = await Promise.all([
    getDashboardStats(range),
    getRecentDesignRequests(),
    getRecentContactMessages(),
    getRecentActivity(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="An overview of NEXFORM's website activity."
        actions={<DateRangeFilter />}
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Button size="sm" render={<Link href="/admin/content/new" />} nativeButton={false}>
          <Plus className="size-4" />
          New Content
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/admin/projects" />} nativeButton={false}>
          <Plus className="size-4" />
          New Project
        </Button>
        <Button size="sm" variant="outline" render={<Link href="/admin/media" />} nativeButton={false}>
          <Plus className="size-4" />
          Upload Media
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="Page Views" value={stats.pageViews} icon={Eye} hint="selected range" />
        <StatCard label="Unique Visitors" value={stats.uniqueSessions} icon={Users} hint="selected range" />
        <StatCard label="Registered Customers" value={stats.customerCount} icon={Users} />
        <StatCard label="Published Content" value={stats.publishedContent} icon={FileText} tone="success" />
        <StatCard label="Draft Content" value={stats.draftContent} icon={FilePenLine} />
        <StatCard label="Projects" value={stats.projectCount} icon={Building2} />
        <StatCard label="Design Ideas" value={stats.designIdeaCount} icon={Sparkles} />
        <StatCard label="Services" value={stats.serviceCount} icon={Wrench} />
        <StatCard label="Journey Steps" value={stats.journeyStepCount} icon={Route} />
        <StatCard label="Library Files" value={stats.libraryFileCount} icon={Library} />
        <StatCard label="FAQ Items" value={stats.faqItemCount} icon={HelpCircle} />
        <StatCard label="Media Files" value={stats.mediaFileCount} icon={ImageIcon} />
        <StatCard label="Downloads" value={stats.downloadCount} icon={Download} hint="selected range" />
        <StatCard label="Companies" value={stats.companyCount} icon={Building} />
        <StatCard label="Active Advertisements" value={stats.activeAdCampaigns} icon={Megaphone} tone="success" />
        <StatCard
          label="Ads Expiring Soon"
          value={stats.expiringAdCampaigns}
          icon={AlarmClock}
          tone={stats.expiringAdCampaigns > 0 ? "warning" : "default"}
        />
        <StatCard
          label="New Design Requests"
          value={stats.newDesignRequestCount}
          icon={ClipboardList}
          tone={stats.newDesignRequestCount > 0 ? "warning" : "default"}
          hint={`${stats.designRequestCount} total`}
        />
        <StatCard
          label="Unread Contact Messages"
          value={stats.unreadContactMessages}
          icon={Mail}
          tone={stats.unreadContactMessages > 0 ? "warning" : "default"}
          hint={`${stats.contactMessageCount} total`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h2>
          <ActivityTimeline
            entries={recentActivity.map((entry) => ({
              id: entry.id,
              action: entry.action,
              entityType: entry.entityType,
              createdAt: entry.createdAt,
              actorName: entry.user?.name ?? entry.user?.email ?? null,
            }))}
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Design Requests</h2>
            <Link href="/admin/design-requests" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <EmptyState title="No design requests yet" icon={ClipboardList} className="py-8" />
          ) : (
            <ul className="space-y-3">
              {recentRequests.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/design-requests/${r.id}`} className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-muted">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.requestNumber} · {formatDistanceToNow(r.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Contact Messages</h2>
            <Link href="/admin/contact-messages" className="text-xs font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <EmptyState title="No messages yet" icon={Mail} className="py-8" />
          ) : (
            <ul className="space-y-3">
              {recentMessages.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/contact-messages/${m.id}`} className="flex items-start justify-between gap-2 rounded-lg p-2 hover:bg-muted">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{m.message}</p>
                    </div>
                    {!m.isRead && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
