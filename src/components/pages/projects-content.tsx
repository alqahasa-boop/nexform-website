"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Building2, Sofa, LayoutPanelLeft, Castle, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: LucideIcon[] = [Home, Building2, Sofa, LayoutPanelLeft, Castle];

export function ProjectsContent() {
  const { t } = useLanguage();
  const p = t.projectsPage;
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const placeholders = p.categories.flatMap((category, categoryIndex) =>
    [0, 1].map((n) => ({ id: `${categoryIndex}-${n}`, categoryIndex, category }))
  );

  const visible =
    activeCategory === null
      ? placeholders
      : placeholders.filter((item) => item.categoryIndex === activeCategory);

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
            {p.categories.map((category, i) => (
              <button
                key={category}
                onClick={() => setActiveCategory(i)}
                className={cn(
                  "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                  activeCategory === i
                    ? "border-gold bg-gold text-ink"
                    : "border-border text-muted-foreground hover:border-gold/50 hover:text-gold"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="mt-16 text-center text-muted-foreground">{p.emptyState}</p>
          ) : (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((item, i) => {
                const Icon = CATEGORY_ICONS[item.categoryIndex];
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                    className="group overflow-hidden rounded-2xl border border-border"
                  >
                    <div className="relative flex aspect-[4/3] items-center justify-center bg-gold-soft/40">
                      <Icon className="h-12 w-12 text-gold/50 transition-transform duration-500 group-hover:scale-110" />
                      <span className="absolute top-4 end-4 rounded-full bg-background/80 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-gold backdrop-blur-sm">
                        {p.comingSoon}
                      </span>
                    </div>
                    <div className="bg-card p-6">
                      <span className="text-xs font-medium uppercase tracking-widest text-gold">
                        {item.category}
                      </span>
                      <h3 className="mt-2 text-lg font-semibold">{p.placeholderTitle}</h3>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
