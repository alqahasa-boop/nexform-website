import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Features } from "@/components/sections/features";
import { Stats } from "@/components/sections/stats";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { Cta } from "@/components/sections/cta";
import { AdSlot } from "@/components/ad-slot";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AdSlot placementKey="homepage-hero-banner" className="my-8 aspect-[16/5] w-full sm:aspect-[6/1]" />
      </div>
      <Features />
      <Stats />
      <WhyChooseUs />
      <Cta />
    </>
  );
}
