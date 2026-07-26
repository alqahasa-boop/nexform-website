"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import heroVilla from "../../public/hero-villa.png";

/**
 * Hero-only background: the uploaded villa photograph with a slow, barely
 * perceptible Ken Burns zoom and a left-to-right dark gradient (left side
 * darker to protect the hero text, right side lighter to let the
 * architecture read clearly). Scoped to the Hero section only — the CTA
 * section keeps its original GeometricBackground treatment.
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.045 }}
        transition={{ duration: 30, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <Image
          src={heroVilla}
          alt=""
          fill
          priority
          quality={95}
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-right"
        />
      </motion.div>

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
