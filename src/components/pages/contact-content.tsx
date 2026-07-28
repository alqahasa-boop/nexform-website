"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageCircle, Share2, Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { InstagramIcon, XIcon, LinkedinIcon } from "@/components/social-icons";

export function ContactContent() {
  const { t } = useLanguage();
  const p = t.contactPage;
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHeader eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      <section className="relative py-24 sm:py-32 bg-background">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3"
          >
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.3em] text-gold">{p.formEyebrow}</p>
            <h2 className="font-heading mt-4 text-2xl sm:text-3xl font-medium tracking-tight">{p.formTitle}</h2>

            {submitted ? (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold-soft/40 p-6">
                <Check className="h-5 w-5 shrink-0 text-gold" />
                <p className="text-sm text-foreground">{p.formSubmit} ✓</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">
                      {p.formName}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="text-sm font-medium">
                      {p.formPhone}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    {p.formEmail}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm font-medium">
                    {p.formMessage}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="mt-2 w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 w-full sm:w-fit px-8 text-base bg-gold text-ink hover:bg-gold/90">
                  {p.formSubmit}
                </Button>
              </form>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <p className="text-xs sm:text-sm font-medium uppercase tracking-[0.3em] text-gold">{p.infoEyebrow}</p>
            <h2 className="font-heading mt-4 text-2xl sm:text-3xl font-medium tracking-tight">{p.infoTitle}</h2>

            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-4 rounded-xl border border-border p-5">
                <Mail className="h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.emailLabel}</p>
                  <a href="mailto:hello@nexform.com" className="text-sm font-medium hover:text-gold">
                    hello@nexform.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-border p-5">
                <MessageCircle className="h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.whatsappLabel}</p>
                  <p className="text-sm font-medium text-muted-foreground">{p.whatsappPlaceholder}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border border-border p-5">
                <Share2 className="h-5 w-5 shrink-0 text-gold" />
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.socialLabel}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {[InstagramIcon, XIcon, LinkedinIcon].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        aria-label="Social link"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30">
                <MapPin className="h-6 w-6 text-gold/50" />
                <p className="text-sm text-muted-foreground">{p.mapPlaceholder}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
