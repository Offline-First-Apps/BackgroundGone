import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";

export default function Home() {
  return (
    <div id="top" className="mx-auto w-full max-w-[1180px]">
      <Nav />
      <Hero />
      {/* Remaining sections are added in the next steps. */}
    </div>
  );
}
