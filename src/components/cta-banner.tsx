"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeometricBackground } from "@/components/geometric-background";
import { useLanguage } from "@/components/language-provider";

export function CtaBanner({ headline, buttonLabel, href = "/contact" }: { headline: string; buttonLabel: string; href?: string }) {
  const { language } = useLanguage();
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="relative flex min-h-[44vh] items-center overflow-hidden py-24">
      <GeometricBackground variant="cta" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 sm:px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white text-balance"
        >
          {headline}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <Button
            render={<Link href={href} />}
            nativeButton={false}
            size="lg"
            className="h-12 px-8 text-base bg-gold text-ink hover:bg-gold/90 gap-2 shadow-lg shadow-gold/20"
          >
            {buttonLabel}
            <ArrowIcon className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
