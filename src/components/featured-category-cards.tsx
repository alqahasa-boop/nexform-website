"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sofa, Building2, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import interiorShowcase from "../../public/interior-showcase.png";
import heroVilla from "../../public/hero-villa.png";

interface CategoryCard {
  key: "interior" | "facade" | "majlis" | "kitchen";
  href: string;
  image?: StaticImageData;
  placeholderIcon: LucideIcon;
}

/**
 * Only interior + facade photography exists in `public/` today — Majlis and
 * Luxury Kitchens show the same "Coming Soon" treatment already used for
 * empty states elsewhere (ProjectsContent, etc.) rather than faking a photo.
 * Add real images here the moment they're supplied — no other changes needed.
 */
const CARDS: CategoryCard[] = [
  { key: "interior", href: "/studio/interior", image: interiorShowcase, placeholderIcon: Sofa },
  { key: "facade", href: "/studio/exterior", image: heroVilla, placeholderIcon: Building2 },
  { key: "majlis", href: "/gallery", placeholderIcon: Sofa },
  { key: "kitchen", href: "/gallery", placeholderIcon: Building2 },
];

export function FeaturedCategoryCards() {
  const { t } = useLanguage();
  const c = t.featuredCategories;

  return (
    <section id="services" className="relative py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-xs sm:text-sm font-medium uppercase tracking-[0.35em] text-gold"
        >
          {c.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading mt-4 text-center text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-balance"
        >
          {c.title}
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card, i) => {
            const item = c.items[card.key];
            const Icon = card.placeholderIcon;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
              >
                <Link
                  href={card.href}
                  className="group relative flex aspect-[3/4] overflow-hidden rounded-2xl border border-border"
                >
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={item.title}
                      fill
                      quality={90}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      placeholder="blur"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted/50">
                      <Icon className="size-9 text-gold/40" />
                      <span className="rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
                        {c.comingSoon}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="relative z-10 mt-auto p-5">
                    <h3 className="font-heading text-lg font-medium text-white">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-white/70">{item.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
