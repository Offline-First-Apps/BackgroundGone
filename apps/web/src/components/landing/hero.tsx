import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BuyButton } from "./buy-button";
import { HeroComposition } from "./hero-composition";
import { MacWaitlistLink } from "./mac-waitlist";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-[34px] pt-10 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[280px] z-0 size-[760px] -translate-x-1/2 rounded-full bg-[image:var(--hero-glow)]"
      />

      <div className="relative z-[2] mb-[26px] inline-flex items-center gap-[9px] rounded-full border border-[var(--badge-border)] bg-[var(--badge-bg)] py-[6px] pl-2 pr-[14px]">
        <Badge variant="new">New</Badge>
        <span className="text-[13px] font-medium text-[var(--badge-fg)]">
          Now on Windows — GPU inference &amp; batch mode
        </span>
      </div>

      <h1 className="relative z-[2] m-0 font-serif text-[84px] font-normal leading-[0.98] tracking-[-0.01em] text-fg">
        Remove the background.
        <br />
        <span className="italic text-[var(--serif-em)]">Keep everything</span>{" "}
        else.
      </h1>

      <p className="relative z-[2] mx-auto mt-6 max-w-[540px] text-[17px] leading-[1.55] text-body">
        A one-click background remover that runs entirely on your PC. No uploads,
        no account, no subscription — you buy it once and{" "}
        <span className="font-semibold text-fg">it&apos;s yours forever.</span>
      </p>

      <div className="relative z-[2] mt-8 flex flex-wrap items-center justify-center gap-3">
        <BuyButton
          variant="brand"
          size="xl"
          className="shadow-[0_12px_26px_-10px_rgba(255,107,107,0.6)]"
        />
        <Button variant="secondary" size="xl" asChild>
          <a href="/how-it-works">See how it works</a>
        </Button>
      </div>

      <div className="relative z-[2] mt-[14px]">
        <MacWaitlistLink className="cursor-pointer border-b border-[var(--secbtn-hover-border)] pb-px text-[13.5px] font-medium text-body transition-colors hover:text-brand">
          Looking for Mac? →
        </MacWaitlistLink>
      </div>

      <div className="relative z-[2] mt-[14px] font-mono text-[12px] text-[var(--faint-2)]">
        One-time $49 · free trial · Windows 10 &amp; 11
      </div>

      <HeroComposition />
    </section>
  );
}
