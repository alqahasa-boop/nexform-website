"use client";

import { motion } from "framer-motion";

/**
 * Cinematic dark backdrop used by Hero and CTA. No photograph is available, so
 * the "luxury architectural scene" is built from a radial gradient plus slow,
 * animated geometric lines/shapes evoking blueprint and facade linework.
 */
export function GeometricBackground({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-ink">
      <div
        className="absolute inset-0"
        style={{
          background:
            variant === "hero"
              ? "radial-gradient(120% 90% at 50% 0%, rgba(201,166,90,0.14) 0%, rgba(10,10,10,0) 55%), radial-gradient(90% 70% at 85% 100%, rgba(201,166,90,0.08) 0%, rgba(10,10,10,0) 60%)"
              : "radial-gradient(80% 80% at 50% 50%, rgba(201,166,90,0.12) 0%, rgba(10,10,10,0) 65%), radial-gradient(60% 60% at 15% 85%, rgba(140,95,60,0.16) 0%, rgba(10,10,10,0) 70%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-[0.18]"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <motion.path
          d="M0 620 L360 620 L460 500 L1200 500"
          stroke="var(--gold)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
        />
        <motion.path
          d="M0 260 L300 260 L420 160 L1200 160"
          stroke="var(--gold)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.path
          d="M760 800 L760 440 L900 320 L900 0"
          stroke="var(--gold)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.4, ease: "easeInOut", delay: 0.6 }}
        />
        <motion.rect
          x="130"
          y="120"
          width="90"
          height="90"
          stroke="var(--gold)"
          strokeWidth="1"
          fill="none"
          initial={{ opacity: 0, rotate: -8 }}
          animate={{ opacity: [0, 0.7, 0.7], rotate: 0, y: [120, 100, 120] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "175px 165px" }}
        />
        <motion.circle
          cx="1040"
          cy="620"
          r="46"
          stroke="var(--gold)"
          strokeWidth="1"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.6], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
    </div>
  );
}
