"use client";

import { Compass, Sofa, Building2, ClipboardCheck, Cuboid, HardHat } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { IconCard } from "@/components/icon-card";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";

const ICONS = [Compass, Sofa, Building2, ClipboardCheck, Cuboid, HardHat];

export function ServicesContent() {
  const { t } = useLanguage();
  const p = t.servicesPage;

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {p.items.map((item, i) => (
              <IconCard
                key={item.title}
                icon={ICONS[i]}
                title={item.title}
                description={item.description}
                badge={p.comingSoon}
                delay={(i % 3) * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
