# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

NEXFORM is a single-page marketing site for a Kuwaiti architectural design studio, built with Next.js App Router. There is no backend, database, CMS, or API layer — it's a static/SSR marketing page (`src/app/page.tsx`) composed of section components, fully bilingual (English/Arabic) with client-side language and theme switching.

## Commands

```bash
npm run dev      # start dev server (Turbopack) at http://localhost:3000
npm run build    # production build (Turbopack)
npm run start    # serve the production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

There is no test suite configured in this repo.

## Architecture

**Rendering:** Next.js App Router (`src/app/`). `layout.tsx` sets up global fonts, metadata/SEO (JSON-LD Organization schema, OpenGraph, sitemap/robots), and wraps the tree in `ThemeProvider` → `LanguageProvider`. `page.tsx` just stacks the section components in order (`Navbar`, `Hero`, `About`, `Features`, `Stats`, `WhyChooseUs`, `Cta`, `Footer`) — it's a single scrolling page with in-page anchor navigation (`#about`, `#services`, etc.), not multi-route.

**i18n:** All user-facing copy lives in `src/lib/translations.ts` as a single `translations` object keyed by `"en" | "ar"`, including a `dir` field (`ltr`/`rtl`) per language. `LanguageProvider` (`src/components/language-provider.tsx`) holds current language in React state, persists it to `localStorage` (`nexform-language`), and syncs `document.documentElement.lang`/`dir` on change. Components consume translated strings via the `useLanguage()` hook (`const { t, language } = useLanguage()`), never by importing `translations` directly. **When adding UI copy, add both `en` and `ar` entries to `translations.ts` and consume them through `t`** — don't hardcode strings in components. Because the whole app depends on `dir`, use logical Tailwind properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`) instead of physical `left`/`right` ones so layouts mirror correctly in RTL.

**Theming:** Dark/light mode via `next-themes` (`ThemeProvider` in `src/components/theme-provider.tsx`), default theme is `dark`, class-based (`attribute="class"`). Colors are CSS custom properties defined in `src/app/globals.css` under `:root` and `.dark`, using OKLCH, and mapped into Tailwind's `@theme inline` block (e.g. `--color-gold`, `--color-ink`, `--color-primary`). Prefer semantic color tokens (`bg-background`, `text-foreground`, `bg-gold`, `text-ink`, `border-border`) over raw Tailwind palette colors so both themes stay correct.

**UI components:** `src/components/ui/` holds shadcn-style primitives (currently just `button.tsx`) built on `@base-ui/react` primitives + `class-variance-authority` for variants, composed via the `cn()` helper (`src/lib/utils.ts`, `clsx` + `tailwind-merge`). This project follows the shadcn convention (`components.json`: style `base-nova`, base color `neutral`, path aliases below) — use the shadcn CLI or match its patterns when adding new primitives rather than hand-rolling ad hoc component APIs. Note `Button` uses base-ui's `render`/`nativeButton` props for polymorphic rendering (e.g. `<Button render={<a href="#contact" />} nativeButton={false}>`), not an `asChild` prop.

**Page sections:** `src/components/sections/` holds one component per homepage section (`hero.tsx`, `about.tsx`, `features.tsx`, `stats.tsx`, `why-choose-us.tsx`, `cta.tsx`). Shared chrome (`navbar.tsx`, `footer.tsx`, `logo.tsx`, `theme-toggle.tsx`, `language-toggle.tsx`, `skip-link.tsx`) lives directly under `src/components/`. Sections are client components (`"use client"`) that read `useLanguage()` for copy and use `framer-motion` for scroll/entrance animations; `TextReveal` (`src/components/text-reveal.tsx`) is the shared animated-headline component.

**Path aliases:** `@/*` maps to `src/*` (see `tsconfig.json` and `components.json` aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`).

**Logo:** `src/components/logo.tsx` renders the fixed brand asset at `public/logo.png` unmodified — do not regenerate, recolor, or replace it without explicit instruction.

**SEO/metadata:** `src/app/robots.ts` and `src/app/sitemap.ts` derive the site URL from `NEXT_PUBLIC_SITE_URL` (falls back to `http://localhost:3000`); `layout.tsx` metadata (title, description, OpenGraph, JSON-LD) should stay in sync with any real copy changes to `hero`/`about` translations.
