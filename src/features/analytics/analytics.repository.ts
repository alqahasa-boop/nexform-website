import { db } from "@/lib/db";
import type { AnalyticsEventType, Prisma } from "@/generated/prisma/client";
import type { AnalyticsDateRange, TrackEventInput } from "./types";

export function trackEvent(input: TrackEventInput) {
  return db.analyticsEvent.create({
    data: {
      type: input.type,
      ...(input.path && { path: input.path }),
      ...(input.entityType && { entityType: input.entityType }),
      ...(input.entityId && { entityId: input.entityId }),
      ...(input.referrer && { referrer: input.referrer }),
      ...(input.country && { country: input.country }),
      ...(input.city && { city: input.city }),
      ...(input.device && { device: input.device }),
      ...(input.browser && { browser: input.browser }),
      ...(input.sessionId && { sessionId: input.sessionId }),
      ...(input.userId && { userId: input.userId }),
      ...(input.searchQuery && { searchQuery: input.searchQuery }),
      ...(input.metadata && { metadata: input.metadata as Prisma.InputJsonValue }),
    },
  });
}

export function countEventsByType(type: AnalyticsEventType, range: AnalyticsDateRange) {
  return db.analyticsEvent.count({ where: { type, createdAt: { gte: range.from, lte: range.to } } });
}

/** Distinct sessions in range — the closest thing to "visitors" without a dedicated identity table. */
export function countUniqueVisitors(range: AnalyticsDateRange) {
  return db.analyticsEvent
    .findMany({
      where: { type: "PAGE_VIEW", createdAt: { gte: range.from, lte: range.to }, sessionId: { not: null } },
      distinct: ["sessionId"],
      select: { sessionId: true },
    })
    .then((rows) => rows.length);
}

export async function mostViewedPaths(range: AnalyticsDateRange, limit = 10) {
  const grouped = await db.analyticsEvent.groupBy({
    by: ["path"],
    where: { type: "PAGE_VIEW", createdAt: { gte: range.from, lte: range.to }, path: { not: null } },
    _count: { path: true },
    orderBy: { _count: { path: "desc" } },
    take: limit,
  });
  return grouped.map((row) => ({ path: row.path, views: row._count.path }));
}

export async function trafficByDevice(range: AnalyticsDateRange) {
  const grouped = await db.analyticsEvent.groupBy({
    by: ["device"],
    where: { createdAt: { gte: range.from, lte: range.to }, device: { not: null } },
    _count: { device: true },
  });
  return grouped.map((row) => ({ device: row.device, count: row._count.device }));
}

export async function trafficByCountry(range: AnalyticsDateRange) {
  const grouped = await db.analyticsEvent.groupBy({
    by: ["country"],
    where: { createdAt: { gte: range.from, lte: range.to }, country: { not: null } },
    _count: { country: true },
  });
  return grouped.map((row) => ({ country: row.country, count: row._count.country }));
}

export async function trafficByReferrer(range: AnalyticsDateRange) {
  const grouped = await db.analyticsEvent.groupBy({
    by: ["referrer"],
    where: { createdAt: { gte: range.from, lte: range.to }, referrer: { not: null } },
    _count: { referrer: true },
  });
  return grouped.map((row) => ({ referrer: row.referrer, count: row._count.referrer }));
}
