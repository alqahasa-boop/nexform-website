"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center", className)}>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="text-xs sm:text-sm font-medium uppercase tracking-[0.35em] text-gold"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-heading mt-4 text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-balance"
      >
        {title}
      </motion.h2>
    </div>
  );
}
