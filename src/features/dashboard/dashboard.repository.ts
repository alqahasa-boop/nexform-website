import { db } from "@/lib/db";

export interface DateRange {
  from: Date;
  to: Date;
}

/** Every figure here comes from a real aggregate query — zero rows renders as 0, never a fabricated number. */
export async function getDashboardStats(range: DateRange) {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const windowed = { gte: range.from, lte: range.to };

  const [
    pageViews,
    uniqueSessions,
    customerCount,
    publishedContent,
    draftContent,
    projectCount,
    designIdeaCount,
    serviceCount,
    journeyStepCount,
    libraryFileCount,
    faqItemCount,
    mediaFileCount,
    downloadCount,
    companyCount,
    activeAdCampaigns,
    expiringAdCampaigns,
    designRequestCount,
    newDesignRequestCount,
    contactMessageCount,
    unreadContactMessages,
  ] = await Promise.all([
    db.analyticsEvent.count({ where: { type: "PAGE_VIEW", createdAt: windowed } }),
    db.analyticsEvent
      .findMany({
        where: { type: "PAGE_VIEW", createdAt: windowed, sessionId: { not: null } },
        distinct: ["sessionId"],
        select: { sessionId: true },
      })
      .then((rows) => rows.length),
    db.userRole.count({ where: { role: { key: "CUSTOMER" } } }),
    db.content.count({ where: { status: "PUBLISHED", deletedAt: null } }),
    db.content.count({ where: { status: "DRAFT", deletedAt: null } }),
    db.project.count({ where: { deletedAt: null } }),
    db.designIdea.count({ where: { deletedAt: null } }),
    db.service.count({ where: { deletedAt: null } }),
    db.constructionJourneyStage.count({ where: { deletedAt: null } }),
    db.constructionLibraryItem.count({ where: { deletedAt: null } }),
    db.faqItem.count({ where: { deletedAt: null } }),
    db.mediaAsset.count({ where: { deletedAt: null } }),
    db.analyticsEvent.count({ where: { type: "DOWNLOAD", createdAt: windowed } }),
    db.company.count({ where: { deletedAt: null } }),
    db.advertisementCampaign.count({ where: { status: "ACTIVE" } }),
    db.advertisementCampaign.count({
      where: { status: "ACTIVE", endDate: { gte: now, lte: sevenDaysFromNow } },
    }),
    db.designRequest.count({ where: { deletedAt: null } }),
    db.designRequest.count({ where: { status: "NEW" } }),
    db.contactMessage.count({ where: { deletedAt: null } }),
    db.contactMessage.count({ where: { isRead: false, deletedAt: null } }),
  ]);

  return {
    pageViews,
    uniqueSessions,
    customerCount,
    publishedContent,
    draftContent,
    projectCount,
    designIdeaCount,
    serviceCount,
    journeyStepCount,
    libraryFileCount,
    faqItemCount,
    mediaFileCount,
    downloadCount,
    companyCount,
    activeAdCampaigns,
    expiringAdCampaigns,
    designRequestCount,
    newDesignRequestCount,
    contactMessageCount,
    unreadContactMessages,
  };
}

export async function getRecentDesignRequests(limit = 5) {
  return db.designRequest.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: { id: true, requestNumber: true, fullName: true, status: true, createdAt: true },
  });
}

export async function getRecentContactMessages(limit = 5) {
  return db.contactMessage.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, message: true, isRead: true, createdAt: true },
  });
}

export async function getRecentActivity(limit = 8) {
  return db.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });
}

export async function getContentAwaitingReview(limit = 5) {
  return db.content.findMany({
    where: { status: "PENDING_REVIEW" },
    take: limit,
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, contentType: true, language: true, updatedAt: true },
  });
}
