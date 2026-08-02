"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";
import interiorShowcase from "../../public/interior-showcase.png";
import heroVilla from "../../public/hero-villa.png";

interface CategoryCard {
  key: "interior" | "facade" | "majlis" | "kitchen";
  href: string;
  image: StaticImageData | string;
  imagePosition?: "center" | "right";
}

/**
 * Interior + facade use the original studio photography; Majlis uses real
 * photography supplied by the site owner (wide-format renders with a dark
 * negative-space margin on the left, hence `imagePosition: "right"` so the
 * crop favors the lit room). Kitchen still uses temporary placeholder
 * photography until real NEXFORM project photos are supplied.
 */
const CARDS: CategoryCard[] = [
  { key: "interior", href: "/studio/interior", image: interiorShowcase },
  { key: "facade", href: "/studio/exterior", image: heroVilla },
  { key: "majlis", href: "/gallery", image: "/uploads/majlis-diwaniya-3.jpg", imagePosition: "right" },
  { key: "kitchen", href: "/gallery", image: "/uploads/b4a5067b-b03b-4347-8e5d-63e603294e33-kitchen-marble-walnut.jpg" },
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
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7, delay: (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={card.href}
                  className="group relative flex aspect-[3/4] overflow-hidden rounded-2xl border border-border shadow-sm transition-shadow duration-300 hover:shadow-xl"
                >
                  <motion.div
                    initial={{ scale: 1.12, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 1, delay: (i % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={card.image}
                      alt={item.title}
                      fill
                      quality={90}
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className={cn(
                        "object-cover transition-transform duration-700 group-hover:scale-105",
                        card.imagePosition === "right" ? "object-right" : "object-center"
                      )}
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  <div className="relative z-10 mt-auto p-5">
                    <h3 className="font-heading text-lg font-medium text-white">{item.title}</h3>
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
