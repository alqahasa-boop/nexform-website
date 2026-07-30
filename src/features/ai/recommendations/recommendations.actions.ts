"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { listPublishedProjects } from "@/features/projects/projects.repository";
import { listPublishedServices } from "@/features/services/services.repository";
import { findMatchingDesignIdeas } from "@/features/design-ideas/design-ideas.repository";
import { findMatchingCompanies } from "@/features/companies/companies.repository";
import { getWorkspace } from "@/features/ai/workspace/workspace.repository";
import { apiSuccess, type ApiResult } from "@/types/api";

export interface RecommendationItem {
  id: string;
  slug: string;
  title: string;
  imageUrl: string | null;
  href: string;
}

export interface RecommendationsResult {
  personalized: boolean;
  projects: RecommendationItem[];
  services: RecommendationItem[];
  designIdeas: RecommendationItem[];
  companies: RecommendationItem[];
}

/**
 * Real filtered/ranked queries against actual content, not machine-learned
 * predictions — "personalized" here means "uses the real preferences the
 * user gave us" (AiUserWorkspace styles/budget), scored by simple overlap.
 * Signed-out visitors and users with no saved preferences yet get honest
 * "featured/recent" real content instead of a fabricated personalization.
 */
export async function getRecommendationsAction(language: string = "en"): Promise<ApiResult<RecommendationsResult>> {
  const session = await getAdminSession();
  const workspace = session ? await getWorkspace(session.id) : null;
  const styleNames = workspace?.favoriteStyles ?? [];
  const styleNamesLower = new Set(styleNames.map((s) => s.toLowerCase()));
  const personalized = styleNamesLower.size > 0 || workspace?.budgetMin != null || workspace?.budgetMax != null;

  const [allProjects, allServices, designIdeas, companies] = await Promise.all([
    listPublishedProjects(language),
    listPublishedServices(language),
    findMatchingDesignIdeas({
      language,
      styleNames,
      budgetMin: workspace?.budgetMin ? Number(workspace.budgetMin) : undefined,
      budgetMax: workspace?.budgetMax ? Number(workspace.budgetMax) : undefined,
      limit: 6,
    }),
    findMatchingCompanies({ limit: 6 }),
  ]);

  const rankedProjects = [...allProjects]
    .sort((a, b) => {
      const aMatch = a.style && styleNamesLower.has(a.style.name.toLowerCase()) ? 1 : 0;
      const bMatch = b.style && styleNamesLower.has(b.style.name.toLowerCase()) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    })
    .slice(0, 6);

  const rankedServices = [...allServices].slice(0, 6);

  return apiSuccess({
    personalized,
    projects: rankedProjects.map((p) => ({ id: p.id, slug: p.slug, title: p.title, imageUrl: p.coverImage?.url ?? null, href: "/projects" })),
    services: rankedServices.map((s) => ({ id: s.id, slug: s.slug, title: s.title, imageUrl: s.coverImage?.url ?? null, href: "/services" })),
    designIdeas: designIdeas.map((d) => ({ id: d.id, slug: d.slug, title: d.title, imageUrl: d.coverImage?.url ?? null, href: "/gallery" })),
    companies: companies.map((c) => ({ id: c.id, slug: c.slug, title: c.name, imageUrl: c.logo?.url ?? null, href: "/companies" })),
  });
}
