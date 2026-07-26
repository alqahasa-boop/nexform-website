"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = ["about", "services", "why-us", "contact"] as const;

export function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const elements = NAV_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const navLabels = [t.nav.about, t.nav.services, t.nav.whyUs, t.nav.contact];

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#top" aria-label="NEXFORM home">
          <Logo variant="compact" />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_SECTIONS.map((id, i) => {
            const isActive = activeSection === id;
            return (
              <a
                key={id}
                href={`#${id}`}
                className={cn(
                  "border-b-2 border-transparent pb-1 text-sm font-medium tracking-wide transition-colors hover:text-gold",
                  isActive ? "border-gold text-gold" : scrolled ? "text-foreground" : "text-white"
                )}
              >
                {navLabels[i]}
              </a>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1">
          <LanguageToggle light={!scrolled} />
          <ThemeToggle light={!scrolled} />
          <Button
            render={<a href="#contact" />}
            nativeButton={false}
            size="sm"
            className="ms-2 bg-gold text-ink hover:bg-gold/90"
          >
            {t.nav.cta}
          </Button>
        </div>

        <button
          className={cn("md:hidden p-2", scrolled ? "text-foreground" : "text-white")}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-md border-b border-border"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {NAV_SECTIONS.map((id, i) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-sm font-medium text-foreground hover:text-gold"
                >
                  {navLabels[i]}
                </a>
              ))}
              <div className="flex items-center justify-between pt-2">
                <LanguageToggle />
                <ThemeToggle />
              </div>
              <Button
                render={<a href="#contact" onClick={() => setMenuOpen(false)} />}
                nativeButton={false}
                className="mt-2 bg-gold text-ink hover:bg-gold/90"
              >
                {t.nav.cta}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
