"use client";

import { motion } from "framer-motion";
import { Compass, Sofa, Castle, Building2, Ruler, Cuboid, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const ICONS: LucideIcon[] = [Compass, Sofa, Castle, Building2, Ruler, Cuboid];

export function Features() {
  const { t } = useLanguage();

  return (
    <section id="services" className="relative overflow-hidden py-24 sm:py-32 bg-muted/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 start-1/4 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 end-1/4 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-xs sm:text-sm font-medium uppercase tracking-[0.3em] text-gold"
        >
          {t.features.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading mt-4 text-center text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-balance"
        >
          {t.features.title}
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                whileHover={{ y: -6 }}
                className="glass group relative rounded-2xl p-8 transition-colors hover:border-gold/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
