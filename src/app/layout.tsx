import type { Metadata } from "next";
import { Geist, Geist_Mono, Tajawal, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "NEXFORM — Architecture, Design, Inspiration";
const description =
  "NEXFORM is a premium Kuwaiti architectural design studio delivering luxury villas, residential facades, interior design, and commercial architecture.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — NEXFORM",
  },
  description,
  keywords: [
    "NEXFORM",
    "architecture Kuwait",
    "luxury villa design",
    "interior design Kuwait",
    "house facade design",
    "architectural design studio",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    languages: {
      en: "/",
      ar: "/",
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title,
    description,
    siteName: "NEXFORM",
    locale: "en_US",
    alternateLocale: "ar_KW",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${tajawal.variable} ${fraunces.variable}`}
    >
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NEXFORM",
              description,
              url: siteUrl,
              areaServed: {
                "@type": "Country",
                name: "Kuwait",
              },
              knowsAbout: [
                "Architectural Design",
                "Interior Design",
                "Luxury Villa Design",
                "House Facades",
                "Floor Plans",
                "3D Visualization",
              ],
            }),
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
