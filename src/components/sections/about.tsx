"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/components/language-provider";
import interiorShowcase from "../../../public/interior-showcase.png";

export function About() {
  const { t, language } = useLanguage();

  return (
    <section id="about" className="relative bg-background">
      <div dir="ltr" className="grid grid-cols-1 lg:grid-cols-[60%_40%]">
        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative min-h-[360px] sm:min-h-[480px] lg:min-h-[680px]"
        >
          <Image
            src={interiorShowcase}
            alt="NEXFORM interior design"
            fill
            quality={95}
            sizes="(min-width: 1024px) 60vw, 100vw"
            placeholder="blur"
            className="object-cover object-left"
          />
        </motion.div>

        <div
          dir={language === "ar" ? "rtl" : "ltr"}
          className="flex items-center px-6 py-16 sm:px-10 lg:px-16 lg:py-0"
        >
          <div className="max-w-md">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-xs sm:text-sm font-medium uppercase tracking-[0.3em] text-gold"
            >
              {t.about.eyebrow}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading mt-4 text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-balance"
            >
              <span className="block">{t.about.titleLine1}</span>
              <span className="block text-muted-foreground">{t.about.titleLine2}</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-8 flex flex-col gap-6"
            >
              <p className="text-base leading-relaxed text-muted-foreground">
                {t.about.paragraph1}
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                {t.about.paragraph2}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
