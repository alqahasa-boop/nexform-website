"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Route, BookOpen, HelpCircle, ArrowRight, ArrowLeft, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { useLanguage } from "@/components/language-provider";

const ICONS: LucideIcon[] = [Route, BookOpen, HelpCircle];

export function KnowledgeContent() {
  const { t, language } = useLanguage();
  const p = t.knowledgePage;
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {p.cards.map((card, i) => {
              const Icon = ICONS[i];
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link
                    href={card.href}
                    className="glass group relative flex h-full flex-col rounded-2xl p-8 transition-colors hover:border-gold/50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gold">
                      {p.cardLinkLabel}
                      <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
