"use client";

import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { Accordion } from "@/components/accordion";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";

export function FaqContent() {
  const { t } = useLanguage();
  const p = t.faqPage;

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />
          <div className="mt-16">
            <Accordion items={p.items} />
          </div>
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
