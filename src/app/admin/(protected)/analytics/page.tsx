import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import {
  countEventsByType,
  countUniqueVisitors,
  mostViewedPaths,
  trafficByDevice,
  trafficByCountry,
  trafficByReferrer,
} from "@/features/analytics/analytics.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { EmptyState } from "@/components/admin/empty-state";
import { DateRangeFilter } from "@/components/admin/date-range-filter";
import { resolveDateRange } from "@/lib/date-range";
import { Eye, Users, Download, MousePointerClick, MessageSquare, Search } from "lucide-react";
import { BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  await requirePermission("analytics:view");

  const params = await searchParams;
  const range = resolveDateRange(params);

  const [
    pageViews,
    uniqueVisitors,
    downloads,
    adClicks,
    contactSubmits,
    designRequestConversions,
    topPaths,
    devices,
    countries,
    referrers,
  ] = await Promise.all([
    countEventsByType("PAGE_VIEW", range),
    countUniqueVisitors(range),
    countEventsByType("DOWNLOAD", range),
    countEventsByType("AD_CLICK", range),
    countEventsByType("CONTACT_SUBMIT", range),
    countEventsByType("DESIGN_REQUEST_CONVERSION", range),
    mostViewedPaths(range),
    trafficByDevice(range),
    trafficByCountry(range),
    trafficByReferrer(range),
  ]);

  const hasAnyData = pageViews > 0 || uniqueVisitors > 0;

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Site traffic and engagement for the selected date range."
        actions={<DateRangeFilter />}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Page Views" value={pageViews} icon={Eye} />
        <StatCard label="Unique Visitors" value={uniqueVisitors} icon={Users} />
        <StatCard label="Downloads" value={downloads} icon={Download} />
        <StatCard label="Ad Clicks" value={adClicks} icon={MousePointerClick} />
        <StatCard label="Contact Submits" value={contactSubmits} icon={MessageSquare} />
        <StatCard label="Design Requests" value={designRequestConversions} icon={Search} />
      </div>

      {!hasAnyData ? (
        <div className="mt-8">
          <EmptyState
            icon={BarChart3}
            title="No analytics data recorded yet"
            description="Once visitors start browsing the site, traffic and engagement metrics will appear here."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <AnalyticsTable title="Most Viewed Pages" rows={topPaths.map((p) => ({ label: p.path ?? "—", value: p.views }))} />
          <AnalyticsTable title="Devices" rows={devices.map((d) => ({ label: d.device ?? "Unknown", value: d.count }))} />
          <AnalyticsTable title="Top Countries" rows={countries.map((c) => ({ label: c.country ?? "Unknown", value: c.count }))} />
          <AnalyticsTable title="Traffic Sources" rows={referrers.map((r) => ({ label: r.referrer ?? "Direct", value: r.count }))} />
        </div>
      )}
    </div>
  );
}

function AnalyticsTable({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between">
              <span className="truncate text-muted-foreground">{row.label}</span>
              <span className="tabular-nums font-medium">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
