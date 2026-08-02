"use client";

import { useEffect, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import heroVilla from "../../public/hero-villa.png";
import interiorShowcase from "../../public/interior-showcase.png";

export interface HeroSlide {
  src: StaticImageData;
  alt: string;
  label: string;
}

/**
 * Only 2 real photos exist in `public/` today (interior + villa facade).
 * Majlis and Luxury Kitchens slots will be added here once real photography
 * is supplied — deliberately not faked with icon placeholders pretending to
 * be photos. Config-driven so adding them later is a one-line change.
 */
export const HERO_SLIDES: HeroSlide[] = [
  { src: interiorShowcase, alt: "Luxury interior design by NEXFORM", label: "Interior Design" },
  { src: heroVilla, alt: "Villa facade design by NEXFORM", label: "Villa Facades" },
];

const ROTATE_MS = 6000;

/**
 * Hero-only background: rotates through `HERO_SLIDES` with a soft crossfade,
 * wrapped in a slow, continuous Ken Burns zoom (unaffected by rotation), plus
 * a left-to-right dark gradient (left darker to protect hero text, right
 * lighter to let the architecture read clearly). Scoped to the Hero section
 * only — the CTA/PageHeader sections keep their GeometricBackground treatment.
 */
export function HeroBackground() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const slide = HERO_SLIDES[index]!;

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.045 }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <AnimatePresence>
          <motion.div
            key={slide.src.src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              quality={95}
              sizes="100vw"
              placeholder="blur"
              className="object-cover object-right"
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {HERO_SLIDES.length > 1 && (
        <div className="absolute bottom-24 start-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={s.label}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-gold" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 28%, rgba(0,0,0,0.34) 55%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/20" />
    </div>
  );
}
