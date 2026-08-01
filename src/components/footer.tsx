"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLanguage } from "@/components/language-provider";
import { InstagramIcon, XIcon, LinkedinIcon } from "@/components/social-icons";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/services", label: t.nav.services },
    { href: "/projects", label: t.nav.projects },
    { href: "/companies", label: t.nav.companies },
    { href: "/knowledge", label: t.nav.knowledge },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <footer className="relative bg-ink text-white/80 pt-14 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col items-start gap-4 sm:col-span-2 md:col-span-1">
            <Logo variant="compact" />
            <p className="text-sm leading-relaxed text-white/60">{t.footer.tagline}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.footer.quickLinksTitle}
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-white/60 hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.footer.contactTitle}
            </h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-white/60">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a href="mailto:hello@nexform.com" className="hover:text-gold transition-colors">
                  hello@nexform.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                <span dir="ltr">+965 0000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-gold" />
                <span>Kuwait City, Kuwait</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white">
              {t.footer.socialTitle}
            </h3>
            <div className="mt-4 flex items-center gap-3">
              {[InstagramIcon, XIcon, LinkedinIcon].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-gold hover:text-gold transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          {t.footer.copyright.replace("{year}", String(year))}
        </div>
      </div>
    </footer>
  );
}
