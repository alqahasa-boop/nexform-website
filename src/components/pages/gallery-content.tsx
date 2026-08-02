"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Star } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";
import { AskAiButton } from "@/components/ai/ask-ai-button";
import { cn } from "@/lib/utils";

export interface GalleryCard {
  slug: string;
  title: string;
  description: string;
  category: string | null;
  roomType: string | null;
  coverImageUrl: string | null;
  featured?: boolean;
  styles: string[];
}

export function GalleryContent({ items }: { items: { en: GalleryCard[]; ar: GalleryCard[] } }) {
  const { language, t } = useLanguage();
  const p = t.galleryPage;
  const published = items[language];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(published.map((item) => item.category).filter((c): c is string => Boolean(c)))),
    [published]
  );

  const visible = activeCategory === null ? published : published.filter((item) => item.category === activeCategory);

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {published.length > 0 ? (
            <>
              {categories.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={cn(
                      "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                      activeCategory === null
                        ? "border-gold bg-gold text-ink"
                        : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
                    )}
                  >
                    {p.allLabel}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={cn(
                        "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                        activeCategory === category
                          ? "border-gold bg-gold text-ink"
                          : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map((item, i) => (
                  <motion.div
                    key={item.slug}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gold-soft/40">
                      {item.coverImageUrl ? (
                        <Image
                          src={item.coverImageUrl}
                          alt={item.title}
                          fill
                          className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105",
                            item.roomType === "Majlis" ? "object-right" : "object-center"
                          )}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Sparkles className="h-12 w-12 text-gold/50" />
                        </div>
                      )}
                      {item.featured && (
                        <span className="absolute top-4 start-4 flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-ink">
                          <Star className="size-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="bg-card p-6">
                      <div className="flex items-center justify-between gap-2">
                        {item.category && <span className="text-xs font-medium uppercase tracking-widest text-gold">{item.category}</span>}
                        {item.styles.length > 0 && <span className="text-xs text-muted-foreground">{item.styles.join(", ")}</span>}
                      </div>
                      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                      {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                      {item.roomType && <p className="mt-1 text-xs text-muted-foreground">{item.roomType}</p>}
                      <AskAiButton
                        className="mt-3"
                        module="INTERIOR_DESIGNER"
                        prefillMessage={`I like this design idea: "${item.title}". Can you tell me more about this style and how to adapt it?`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                  className="group overflow-hidden rounded-2xl border border-border"
                >
                  <div className="relative flex aspect-[4/3] items-center justify-center bg-gold-soft/40">
                    <Sparkles className="h-12 w-12 text-gold/50 transition-transform duration-500 group-hover:scale-110" />
                    <span className="absolute top-4 end-4 rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-gold backdrop-blur-sm">
                      {p.comingSoon}
                    </span>
                  </div>
                  <div className="bg-card p-6">
                    <h3 className="mt-2 text-lg font-semibold">{p.placeholderTitle}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
