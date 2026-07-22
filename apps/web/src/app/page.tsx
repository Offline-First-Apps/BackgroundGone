import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { Nav } from "@/components/landing/nav";
import { YouOwnIt } from "@/components/landing/you-own-it";

export default function Home() {
  return (
    <div id="top" className="mx-auto w-full max-w-[1180px]">
      <Nav />
      <Hero />
      <LogoStrip />
      <YouOwnIt />
      {/* Remaining sections are added in the next steps. */}
    </div>
  );
}
