"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Eye, Lightbulb, Target, Sparkles, Rocket, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const ICONS: LucideIcon[] = [Eye, Lightbulb, Target, Sparkles, Rocket];

export function WhyChooseUs() {
  const { t } = useLanguage();
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.4"],
  });
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="why-us" className="relative py-24 sm:py-32 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-xs sm:text-sm font-medium uppercase tracking-[0.3em] text-gold"
        >
          {t.whyChooseUs.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading mt-4 text-center text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-balance"
        >
          {t.whyChooseUs.title}
        </motion.h2>

        <div ref={timelineRef} className="relative mt-20">
          <div className="absolute start-0 top-6 hidden h-px w-full bg-border md:block" />
          <motion.div
            style={{ width: lineWidth }}
            className="absolute start-0 top-6 hidden h-px bg-gold md:block"
          />
          <div className="absolute start-6 top-0 h-full w-px bg-border md:hidden" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute start-6 top-0 w-px bg-gold md:hidden"
          />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-6">
            {t.whyChooseUs.steps.map((step, i) => {
              const Icon = ICONS[i];
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="relative flex items-start gap-4 md:flex-col md:items-center md:text-center md:gap-4"
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-background text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="md:mt-2">
                    <span className="text-xs font-medium uppercase tracking-widest text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
