"use client";

import Image from "next/image";
import Link from "next/link";
import { Compass, Sofa, Building2, ClipboardCheck, Cuboid, HardHat, Check, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { IconCard } from "@/components/icon-card";
import { CtaBanner } from "@/components/cta-banner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

const ICONS = [Compass, Sofa, Building2, ClipboardCheck, Cuboid, HardHat];

const ICON_REGISTRY: Record<string, LucideIcon> = {
  Compass,
  Sofa,
  Building2,
  ClipboardCheck,
  Cuboid,
  HardHat,
};

export interface ServiceCard {
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  icon?: string | null;
  features?: string[];
  ctaLabel?: string | null;
  ctaUrl?: string | null;
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
              {published.map((service) => {
                const ServiceIcon = (service.icon && ICON_REGISTRY[service.icon]) || null;
                return (
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
                      {ServiceIcon && (
                        <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <ServiceIcon className="size-5" />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                      {service.description && <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>}
                      {service.features && service.features.length > 0 && (
                        <ul className="mt-4 space-y-1.5">
                          {service.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                      {service.ctaLabel && service.ctaUrl && (
                        <Button size="sm" className="mt-5" render={<Link href={service.ctaUrl} />} nativeButton={false}>
                          {service.ctaLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
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
