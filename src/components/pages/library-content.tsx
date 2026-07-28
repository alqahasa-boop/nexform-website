"use client";

import {
  Wallet,
  Landmark,
  BookOpen,
  FileText,
  FileType,
  FileImage,
  PenTool,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { IconCard } from "@/components/icon-card";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";

const ICONS: LucideIcon[] = [Wallet, Landmark, BookOpen, FileText, FileType, FileImage, PenTool, ListChecks];

export interface LibraryCategoryData {
  title: string;
  description: string;
  count: number;
}

export function LibraryContent({ categories }: { categories: { en: LibraryCategoryData[]; ar: LibraryCategoryData[] } }) {
  const { language, t } = useLanguage();
  const p = t.libraryPage;
  const published = categories[language];
  const isFromCms = published.length > 0;
  const visible = isFromCms ? published : p.categories.map((c) => ({ ...c, count: 0 }));

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((category, i) => (
              <IconCard
                key={category.title}
                icon={ICONS[i % ICONS.length]}
                title={category.title}
                description={category.description}
                badge={isFromCms ? `${category.count}` : p.comingSoon}
                delay={(i % 4) * 0.08}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
