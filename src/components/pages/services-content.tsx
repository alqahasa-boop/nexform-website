"use client";

import Image from "next/image";
import { Compass, Sofa, Building2, ClipboardCheck, Cuboid, HardHat } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { IconCard } from "@/components/icon-card";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";

const ICONS = [Compass, Sofa, Building2, ClipboardCheck, Cuboid, HardHat];

export interface ServiceCard {
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
}

export function ServicesContent({ services }: { services: { en: ServiceCard[]; ar: ServiceCard[] } }) {
  const { language, t } = useLanguage();
  const p = t.servicesPage;
  const published = services[language];

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />

          {published.length > 0 ? (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {published.map((service) => (
                <div key={service.slug} className="group relative overflow-hidden rounded-2xl border border-border bg-card">
                  {service.coverImageUrl && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={service.coverImageUrl}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                    {service.description && <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
