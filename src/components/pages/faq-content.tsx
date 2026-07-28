"use client";

import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { Accordion } from "@/components/accordion";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";

export interface FaqItemData {
  question: string;
  answer: string;
}

export function FaqContent({ faqItems }: { faqItems: { en: FaqItemData[]; ar: FaqItemData[] } }) {
  const { language, t } = useLanguage();
  const p = t.faqPage;
  const published = faqItems[language];
  const items = published.length > 0 ? published : p.items;

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />
          <div className="mt-16">
            <Accordion items={items} />
          </div>
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
