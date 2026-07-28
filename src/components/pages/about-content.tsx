"use client";

import { motion } from "framer-motion";
import { Telescope, Target, ShieldCheck, Hammer, Sparkles, Handshake, MapPin, Layers, PenTool } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
import { IconCard } from "@/components/icon-card";
import { CtaBanner } from "@/components/cta-banner";
import { useLanguage } from "@/components/language-provider";

const VALUE_ICONS = [ShieldCheck, Hammer, Sparkles, Handshake];
const WHY_ICONS = [MapPin, Layers, PenTool];

export function AboutContent() {
  const { t } = useLanguage();
  const p = t.aboutPage;

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.introEyebrow} title={p.introTitle} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-10 flex flex-col gap-6 text-center"
          >
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{p.introParagraph1}</p>
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{p.introParagraph2}</p>
          </motion.div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <IconCard icon={Telescope} title={p.visionTitle} description={p.visionText} />
            <IconCard icon={Target} title={p.missionTitle} description={p.missionText} delay={0.1} />
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.valuesEyebrow} title={p.valuesTitle} />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {p.values.map((value, i) => (
              <IconCard
                key={value.title}
                icon={VALUE_ICONS[i]}
                title={value.title}
                description={value.description}
                delay={(i % 4) * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 sm:py-32 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={p.whyEyebrow} title={p.whyTitle} />
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {p.whyItems.map((item, i) => (
              <IconCard
                key={item.title}
                icon={WHY_ICONS[i]}
                title={item.title}
                description={item.description}
                delay={(i % 3) * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner headline={p.ctaHeadline} buttonLabel={p.ctaButton} />
    </>
  );
}
