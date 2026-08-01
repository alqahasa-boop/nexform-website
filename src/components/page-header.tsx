"use client";

import { motion } from "framer-motion";
import { GeometricBackground } from "@/components/geometric-background";

/**
 * Shared sub-page banner reusing the existing GeometricBackground (same
 * treatment as the homepage CTA section) so every new page opens with the
 * established dark/gold identity — without touching the homepage Hero.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative flex min-h-[38vh] sm:min-h-[42vh] items-center justify-center overflow-hidden pt-28 sm:pt-32">
      <GeometricBackground variant="cta" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 sm:px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs sm:text-sm font-medium uppercase tracking-[0.35em] text-gold"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="font-heading text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white text-balance"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="max-w-xl text-base sm:text-lg leading-relaxed text-white/65 text-balance"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
