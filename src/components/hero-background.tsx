"use client";

import { motion } from "framer-motion";

/**
 * Replaces the previous dark rotating villa-photo background. Instead of
 * imagery, the Hero's identity is a light, architectural blueprint motif —
 * a fine construction grid plus a couple of line-art drafting details that
 * softly draw themselves in on load. Purely decorative (aria-hidden) and
 * kept at very low opacity so it reads as texture, never competes with the
 * search bar or headline. Uses theme tokens (not literal colors) so it
 * still renders correctly if the user switches to dark mode.
 */
export function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-background" aria-hidden="true">
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 1px, transparent 1px), linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.07] dark:opacity-[0.1]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--gold) 1px, transparent 1px), linear-gradient(to bottom, var(--gold) 1px, transparent 1px)",
          backgroundSize: "280px 280px",
        }}
      />

      <svg
        className="absolute -top-16 -end-24 h-[420px] w-[420px] text-foreground/[0.06] sm:-end-10 sm:h-[520px] sm:w-[520px]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <motion.rect
          x="60"
          y="60"
          width="220"
          height="280"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeInOut" }}
        />
        <motion.line
          x1="60"
          y1="60"
          x2="280"
          y2="340"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.3, ease: "easeInOut" }}
        />
        <motion.circle
          cx="170"
          cy="200"
          r="90"
          stroke="currentColor"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.6, ease: "easeInOut" }}
        />
        <line x1="170" y1="110" x2="170" y2="290" stroke="currentColor" strokeWidth="1" />
        <line x1="80" y1="200" x2="260" y2="200" stroke="currentColor" strokeWidth="1" />
      </svg>

      <svg
        className="absolute -bottom-20 -start-20 h-[340px] w-[340px] text-gold/[0.16] sm:h-[420px] sm:w-[420px]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <motion.path
          d="M40 340 L40 120 L200 40 L360 120 L360 340"
          stroke="currentColor"
          strokeWidth="1.2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
        <line x1="20" y1="340" x2="380" y2="340" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/80" />
    </div>
  );
}
