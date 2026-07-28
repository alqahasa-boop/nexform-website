import { LanguageProvider } from "@/components/language-provider";
import { SkipLink } from "@/components/skip-link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SkipLink />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </LanguageProvider>
  );
}
