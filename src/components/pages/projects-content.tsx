"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Home, Building2, Sofa, LayoutPanelLeft, Castle, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: LucideIcon[] = [Home, Building2, Sofa, LayoutPanelLeft, Castle];

export interface ProjectCard {
  slug: string;
  title: string;
  summary: string;
  category: string | null;
  location: string | null;
  coverImageUrl: string | null;
}

export function ProjectsContent({ projects }: { projects: { en: ProjectCard[]; ar: ProjectCard[] } }) {
  const { language, t } = useLanguage();
  const p = t.projectsPage;
  const published = projects[language];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(published.map((item) => item.category).filter((c): c is string => Boolean(c)))),
    [published]
  );

  const visible = activeCategory === null ? published : published.filter((item) => item.category === activeCategory);

  const placeholders = p.categories.flatMap((category, categoryIndex) =>
    [0, 1].map((n) => ({ id: `${categoryIndex}-${n}`, categoryIndex, category }))
  );

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
                {visible.map((project, i) => (
                  <motion.div
                    key={project.slug}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                    className="group overflow-hidden rounded-2xl border border-border"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gold-soft/40">
                      {project.coverImageUrl ? (
                        <Image
                          src={project.coverImageUrl}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Building2 className="h-12 w-12 text-gold/50" />
                        </div>
                      )}
                    </div>
                    <div className="bg-card p-6">
                      {project.category && (
                        <span className="text-xs font-medium uppercase tracking-widest text-gold">{project.category}</span>
                      )}
                      <h3 className="mt-2 text-lg font-semibold">{project.title}</h3>
                      {project.summary && <p className="mt-1 text-sm text-muted-foreground">{project.summary}</p>}
                      {project.location && <p className="mt-1 text-xs text-muted-foreground">{project.location}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {placeholders.map((item, i) => {
                const Icon = CATEGORY_ICONS[item.categoryIndex];
                return (
                  <motion.div
                    key={item.id}
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
                      <span className="text-xs font-medium uppercase tracking-widest text-gold">{item.category}</span>
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
