import { CompareDemo } from "@/components/landing/compare-demo";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { Nav } from "@/components/landing/nav";
import { Pricing } from "@/components/landing/pricing";
import { Stats } from "@/components/landing/stats";
import { YouOwnIt } from "@/components/landing/you-own-it";

export default function Home() {
  return (
    <div className="min-h-screen sm:px-6 sm:py-8">
      <div
        id="top"
        className="mx-auto w-full max-w-[1180px] overflow-hidden border-hairline bg-page sm:rounded-[28px] sm:border sm:shadow-[0_40px_90px_-50px_rgba(0,0,0,0.4)]"
      >
        <Nav />
        <Hero />
        <LogoStrip />
        <CompareDemo />
        <YouOwnIt />
        <Features />
        <Stats />
        <Pricing />
        <Footer />
      </div>
    </div>
  );
}
