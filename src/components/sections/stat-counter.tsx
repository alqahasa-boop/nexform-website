"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";

function parseStat(value: string) {
  const match = value.match(/\d+/);
  if (!match) return { prefix: "", target: null, suffix: value };
  const target = parseInt(match[0], 10);
  const prefix = value.slice(0, match.index);
  const suffix = value.slice((match.index ?? 0) + match[0].length);
  return { prefix, target, suffix };
}

export function StatCounter({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { prefix, target, suffix } = parseStat(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || target === null) return;
    const controls = animate(0, target, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-2 text-center"
    >
      <span className="font-heading text-4xl sm:text-5xl font-medium tracking-tight text-gold tabular-nums">
        {prefix}
        {target !== null ? display : value}
        {suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </motion.div>
  );
}
