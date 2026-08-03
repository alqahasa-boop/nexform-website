"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);
  const [mobileKnowledgeOpen, setMobileKnowledgeOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setMobileKnowledgeOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/services", label: t.nav.services },
    { href: "/projects", label: t.nav.projects },
    { href: "/companies", label: t.nav.companies },
  ];

  const knowledgeLinks = [
    { href: "/knowledge/build-journey", label: t.nav.knowledgeItems.buildJourney },
    { href: "/knowledge/library", label: t.nav.knowledgeItems.library },
    { href: "/knowledge/faq", label: t.nav.knowledgeItems.faq },
  ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const isKnowledgeActive = pathname.startsWith("/knowledge");

  const linkClass = (active: boolean) =>
    cn(
      "border-b-2 border-transparent pb-0.5 text-[13.5px] font-medium text-foreground/80 transition-colors hover:text-gold",
      active && "border-gold text-gold"
    );

  return (
    <header className="fixed inset-x-0 top-9 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      {/* Floating glass pill — always frosted, not just after scroll, so it reads clearly over any hero image. */}
      <div
        className={cn(
          "glass mx-auto flex h-16 sm:h-[4.25rem] max-w-5xl items-center justify-between gap-4 rounded-full px-5 sm:px-7 shadow-lg shadow-black/[0.03] transition-shadow duration-300",
          scrolled && "shadow-black/[0.06]"
        )}
      >
        <Link href="/" aria-label="NEXFORM home" className="shrink-0">
          <Logo variant="compact" className="w-24 sm:w-28" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 lg:gap-9">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(isActive(link.href))}>
              {link.label}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={() => setKnowledgeOpen(true)}
            onMouseLeave={() => setKnowledgeOpen(false)}
          >
            <Link
              href="/knowledge"
              className={cn("flex items-center gap-1", linkClass(isKnowledgeActive))}
              onClick={() => setKnowledgeOpen(false)}
            >
              {t.nav.knowledge}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", knowledgeOpen && "rotate-180")} />
            </Link>
            <AnimatePresence>
              {knowledgeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="glass absolute start-0 top-full mt-3 min-w-[220px] rounded-xl p-2 shadow-2xl"
                >
                  {knowledgeLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setKnowledgeOpen(false)}
                      className="block rounded-lg px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/contact" className={linkClass(isActive("/contact"))}>
            {t.nav.contact}
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <div className="flex flex-col items-center justify-center leading-none" dir="ltr" aria-label="Kuwait">
            <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Kuwait</span>
            <span className="mt-1 text-xs" aria-hidden>
              🇰🇼
            </span>
          </div>

          <div className="h-6 w-px bg-border" aria-hidden />

          <div className="flex items-center gap-1">
            <LanguageToggle />
            <ThemeToggle />
            <Link
              href="/customer/dashboard"
              aria-label="Account"
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <User className="h-4 w-4" />
            </Link>
          </div>

          <Button
            render={<Link href="/contact" />}
            nativeButton={false}
            size="sm"
            className="rounded-full bg-gold text-ink hover:bg-gold/90"
          >
            {t.nav.cta}
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
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
            className="glass md:hidden mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl shadow-lg"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "py-2.5 text-sm font-medium hover:text-gold",
                    isActive(link.href) ? "text-gold" : "text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div>
                <button
                  onClick={() => setMobileKnowledgeOpen((v) => !v)}
                  className={cn(
                    "flex w-full items-center justify-between py-2.5 text-sm font-medium hover:text-gold",
                    isKnowledgeActive ? "text-gold" : "text-foreground"
                  )}
                >
                  {t.nav.knowledge}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", mobileKnowledgeOpen && "rotate-180")}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {mobileKnowledgeOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden ps-4"
                    >
                      {knowledgeLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block py-2 text-sm text-muted-foreground hover:text-gold"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/contact"
                className={cn(
                  "py-2.5 text-sm font-medium hover:text-gold",
                  isActive("/contact") ? "text-gold" : "text-foreground"
                )}
              >
                {t.nav.contact}
              </Link>

              <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
                <div className="flex flex-col items-center justify-center leading-none" dir="ltr" aria-label="Kuwait">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Kuwait</span>
                  <span className="mt-1 text-xs" aria-hidden>
                    🇰🇼
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </div>
              <Button
                render={<Link href="/contact" />}
                nativeButton={false}
                className="mt-2 rounded-full bg-gold text-ink hover:bg-gold/90"
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
