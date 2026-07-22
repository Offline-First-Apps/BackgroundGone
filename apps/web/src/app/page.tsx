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
    <div id="top" className="mx-auto w-full max-w-[1180px]">
      <Nav />
      <Hero />
      <LogoStrip />
      <YouOwnIt />
      <Features />
      <Stats />
      <Pricing />
      <Footer />
    </div>
  );
}
