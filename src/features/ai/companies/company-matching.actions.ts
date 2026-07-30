"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getGuestSessionId } from "@/lib/ai/guest-session";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";
import { isAiConfigured } from "@/lib/ai/provider-registry";
import { runChatTask } from "@/lib/ai/orchestrator";
import { listCategories } from "@/features/categories/categories.repository";
import { findMatchingCompanies } from "@/features/companies/companies.repository";
import { isModuleEnabled } from "@/features/ai/settings/settings.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

export interface MatchedCompany {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  whatsapp: string | null;
  phone: string | null;
  featured: boolean;
  verified: boolean;
  categories: string[];
  galleryUrls: string[];
  matchReason: string;
}

export interface CompanyMatchInput {
  categoryNames?: string[];
  budgetMin?: number;
  budgetMax?: number;
  language: string;
}

export interface CompanyMatchResult {
  companies: MatchedCompany[];
  narrative: string | null;
}

/**
 * Real, rule-based ranking against actual Company rows — functions fully
 * without an AI provider configured (category overlap + verification +
 * featured + profile-view popularity). AI only adds an optional narrative
 * explanation on top when a provider is available; the matches themselves
 * never depend on it, since connecting users to real engineering offices is
 * the whole point of this module and must not go dark just because no
 * provider key is set.
 */
export async function matchCompaniesAction(input: CompanyMatchInput): Promise<ApiResult<CompanyMatchResult>> {
  if (!(await isModuleEnabled("COMPANY_MATCHING"))) {
    return apiError("Company matching is temporarily unavailable — please try again later.", "MODULE_DISABLED");
  }

  const session = await getAdminSession();
  const guestSessionId = session ? null : await getGuestSessionId();
  const rateKey = session ? `ai-matching:user:${session.id}` : `ai-matching:guest:${guestSessionId ?? "anon"}`;
  const { allowed } = rateLimit({ key: rateKey, ...RATE_LIMIT_PRESETS.aiMatching });
  if (!allowed) return apiError("Too many requests — please wait a moment and try again.", "RATE_LIMITED");

  let categoryIds: string[] = [];
  if (input.categoryNames?.length) {
    const companyCategories = await listCategories("COMPANY");
    const wanted = new Set(input.categoryNames.map((n) => n.toLowerCase().trim()));
    categoryIds = companyCategories.filter((c) => wanted.has(c.name.toLowerCase())).map((c) => c.id);
  }

  const companies = await findMatchingCompanies({ categoryIds, limit: 6 });

  const matches: MatchedCompany[] = companies.map((company) => {
    const categoryNames = company.categories.map((c) => c.category.name);
    const overlap = categoryNames.filter((n) => input.categoryNames?.some((w) => w.toLowerCase() === n.toLowerCase()));
    const reasons: string[] = [];
    if (overlap.length > 0) reasons.push(`Specializes in ${overlap.join(", ")}`);
    if (company.verificationStatus === "VERIFIED") reasons.push("Verified by NEXFORM");
    if (company.featured) reasons.push("Featured partner");
    if (reasons.length === 0) reasons.push("Active NEXFORM directory member");

    return {
      id: company.id,
      slug: company.slug,
      name: company.name,
      description: company.description,
      logoUrl: company.logo?.url ?? null,
      website: company.website,
      whatsapp: company.whatsapp,
      phone: company.phone,
      featured: company.featured,
      verified: company.verificationStatus === "VERIFIED",
      categories: categoryNames,
      galleryUrls: company.gallery.map((g) => g.mediaAsset.url),
      matchReason: reasons.join(" · "),
    };
  });

  let narrative: string | null = null;
  if (matches.length > 0 && isAiConfigured()) {
    try {
      const context = matches
        .map((m, i) => `[${i + 1}] ${m.name} — ${m.categories.join(", ") || "General"}. ${m.matchReason}.`)
        .join("\n");
      const result = await runChatTask({
        module: "COMPANY_MATCHING",
        messages: [
          {
            role: "user",
            content: `Write a 2-3 sentence friendly summary of why these matched offices are a good starting point for the user's request.`,
          },
        ],
        language: input.language,
        knowledgeContext: context,
        context: { userId: session?.id, guestSessionId: guestSessionId ?? undefined },
      });
      narrative = result.content;
    } catch {
      narrative = null;
    }
  }

  return apiSuccess({ companies: matches, narrative });
}
