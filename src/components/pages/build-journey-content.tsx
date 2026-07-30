"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin,
  ClipboardList,
  Compass,
  FileCheck,
  Users,
  HardHat,
  PaintRoller,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";
import { AskAiButton } from "@/components/ai/ask-ai-button";

const ICONS: LucideIcon[] = [MapPin, ClipboardList, Compass, FileCheck, Users, HardHat, PaintRoller, KeyRound];

export interface JourneyStepData {
  title: string;
  description: string;
}

export function BuildJourneyContent({ steps }: { steps: { en: JourneyStepData[]; ar: JourneyStepData[] } }) {
  const { language, t } = useLanguage();
  const p = t.buildJourneyPage;
  const published = steps[language];
  const isFromCms = published.length > 0;
  const visibleSteps = isFromCms ? published : p.steps;
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.75", "end 0.6"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.eyebrow} title={p.title} />

          <div ref={timelineRef} className="relative mt-20">
            <div className="absolute start-6 top-0 h-full w-px bg-border" />
            <motion.div style={{ height: lineHeight }} className="absolute start-6 top-0 w-px bg-gold" />

            <div className="flex flex-col gap-12">
              {visibleSteps.map((step, i) => {
                const Icon = ICONS[i % ICONS.length]!;
                return (
                  <motion.div
                    key={`${step.title}-${i}`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6, delay: (i % 4) * 0.08 }}
                    className="relative flex items-start gap-6"
                  >
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-background text-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="pt-2">
                      <span className="text-xs font-medium uppercase tracking-widest text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                      {isFromCms ? (
                        <div
                          className="prose prose-sm dark:prose-invert mt-2 max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: step.description }}
                        />
                      ) : (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                      )}
                      <AskAiButton
                        className="mt-3"
                        module="BUILD_JOURNEY_ASSISTANT"
                        prefillMessage={`What should I know about this stage: "${step.title}"?`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {!isFromCms && <p className="mt-16 text-center text-sm text-muted-foreground">{p.comingSoon}</p>}
        </div>
      </section>

      <CtaBanner headline={t.cta.headline} buttonLabel={t.hero.primaryBtn} />
    </>
  );
}
