import { LanguageProvider } from "@/components/language-provider";
import { SkipLink } from "@/components/skip-link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AiWidget } from "@/components/ai/ai-widget";
import { AiWidgetProvider } from "@/components/ai/ai-widget-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AiWidgetProvider>
        <SkipLink />
        <Navbar />
        <main id="main-content" className="pb-20 md:pb-0">
          {children}
        </main>
        <Footer />
        <AiWidget />
        <MobileBottomNav />
      </AiWidgetProvider>
    </LanguageProvider>
  );
}
