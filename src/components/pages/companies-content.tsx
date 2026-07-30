"use client";

import Image from "next/image";
import { Building2, Star, Globe, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";
import { AskAiButton } from "@/components/ai/ask-ai-button";

export interface CompanyCard {
  slug: string;
  name: string;
  description: string;
  logoUrl: string | null;
  website: string | null;
  whatsapp: string | null;
  phone: string | null;
  categories: string[];
  featured: boolean;
  packageName: string | null;
}

export function CompaniesContent({ companies }: { companies: CompanyCard[] }) {
  const { t } = useLanguage();
  const p = t.companiesPage;

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />

          {companies.length > 0 ? (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <div key={company.slug} className="relative flex flex-col rounded-2xl border border-border bg-card p-6">
                  {company.featured && (
                    <span className="absolute top-4 end-4 flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-ink">
                      <Star className="size-3 fill-current" />
                      {p.featuredLabel}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    {company.logoUrl ? (
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                        <Image src={company.logoUrl} alt={company.name} fill className="object-contain p-1.5" sizes="48px" />
                      </div>
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                        <Building2 className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-foreground">{company.name}</h3>
                      {company.packageName && <p className="text-xs text-gold">{company.packageName}</p>}
                    </div>
                  </div>

                  {company.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {company.categories.map((cat) => (
                        <span key={cat} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {company.description && <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{company.description}</p>}

                  <div className="mt-4 flex flex-wrap items-center gap-3 pt-3">
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <Globe className="size-3.5" />
                        {p.visitWebsite}
                      </a>
                    )}
                    {(company.whatsapp || company.phone) && (
                      <a
                        href={`tel:${company.whatsapp ?? company.phone}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="size-3.5" />
                        {p.contact}
                      </a>
                    )}
                  </div>
                  <AskAiButton
                    className="mt-3 self-start"
                    module="COMPANY_MATCHING"
                    prefillMessage={`Is "${company.name}" a good fit for my project? What do they specialize in?`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 flex flex-col items-center rounded-2xl border border-dashed border-border py-20 text-center">
              <Building2 className="size-10 text-muted-foreground/60" />
              <p className="mt-4 text-lg font-medium text-foreground">{p.comingSoon}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.emptyState}</p>
            </div>
          )}
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
