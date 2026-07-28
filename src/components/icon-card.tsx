"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconCard({
  icon: Icon,
  title,
  description,
  delay = 0,
  badge,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  badge?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6 }}
      className={cn(
        "glass group relative rounded-2xl p-8 transition-colors hover:border-gold/50",
        className
      )}
    >
      {badge && (
        <span className="absolute top-6 end-6 rounded-full bg-gold-soft px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-gold">
          {badge}
        </span>
      )}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold transition-transform duration-300 group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  );
}
