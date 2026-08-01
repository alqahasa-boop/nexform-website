"use client";

import Image from "next/image";
import { Building2, Globe, Phone, ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { QuoteRequestDialog } from "@/components/quote-request-dialog";
import { Button } from "@/components/ui/button";
import type { MatchedCompany } from "@/features/ai/companies/company-matching.actions";

/** Module 11 — the real "connect with an engineering office" surface after an AI concept is generated. */
export function MatchedCompaniesList({
  companies,
  narrative,
  conceptId,
}: {
  companies: MatchedCompany[];
  narrative: string | null;
  conceptId?: string;
}) {
  const { language } = useLanguage();
  const copy =
    language === "ar"
      ? { title: "مكاتب هندسية موصى بها", verified: "موثّق", featured: "مميز", requestQuote: "طلب عرض سعر" }
      : { title: "Recommended Engineering Offices", verified: "Verified", featured: "Featured", requestQuote: "Request a Quote" };

  if (companies.length === 0) return null;

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-foreground">{copy.title}</p>
      {narrative && (
        <p className="mb-3 rounded-xl border border-ai/25 bg-ai-soft/40 p-3 text-sm text-foreground">{narrative}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {companies.map((company) => (
          <div key={company.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              {company.logoUrl ? (
                <div className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                  <Image src={company.logoUrl} alt={company.name} fill className="object-contain p-1" sizes="40px" />
                </div>
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{company.name}</p>
                <div className="flex items-center gap-1.5">
                  {company.verified && (
                    <span className="flex items-center gap-0.5 text-[10px] text-primary">
                      <ShieldCheck className="size-3" />
                      {copy.verified}
                    </span>
                  )}
                  {company.featured && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gold">
                      <Star className="size-3 fill-current" />
                      {copy.featured}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{company.matchReason}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Globe className="size-3.5" />
                </a>
              )}
              {(company.whatsapp || company.phone) && (
                <a href={`tel:${company.whatsapp ?? company.phone}`} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="size-3.5" />
                </a>
              )}
              <QuoteRequestDialog
                trigger={
                  <Button size="xs" variant="outline">
                    {copy.requestQuote}
                  </Button>
                }
                prefill={
                  conceptId
                    ? { conceptId, notes: `Interested in working with ${company.name}.` }
                    : { notes: `Interested in working with ${company.name}.` }
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
