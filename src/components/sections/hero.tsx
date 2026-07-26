"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { HeroBackground } from "@/components/hero-background";
import { TextReveal } from "@/components/text-reveal";
import { useLanguage } from "@/components/language-provider";

export function Hero() {
  const { t, language } = useLanguage();
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-16 sm:pt-20"
    >
      <HeroBackground />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Logo variant="full" />
        </motion.div>

        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white text-balance">
          <TextReveal text={t.hero.headline} delay={0.5} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-2xl text-base sm:text-lg text-white/70 text-balance"
        >
          {t.hero.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center gap-4 pt-2"
        >
          <Button
            render={<a href="#contact" />}
            nativeButton={false}
            size="lg"
            className="h-12 px-8 text-base bg-gold text-ink hover:bg-gold/90 gap-2"
          >
            {t.hero.primaryBtn}
            <ArrowIcon className="h-4 w-4" />
          </Button>
          <Button
            render={<a href="#services" />}
            nativeButton={false}
            size="lg"
            variant="outline"
            className="h-12 px-8 text-base border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            {t.hero.secondaryBtn}
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="h-10 w-6 rounded-full border border-white/30 flex justify-center p-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-gold"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
