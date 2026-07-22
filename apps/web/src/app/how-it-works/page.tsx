import type { Metadata } from "next";

import { BuyButton } from "@/components/landing/buy-button";
import { Footer } from "@/components/landing/footer";
import { Nav } from "@/components/landing/nav";

export const metadata: Metadata = {
  title: "How it works — BackgroundGone",
  description:
    "Buy once, get the installer in your inbox, install in a click, and start removing backgrounds on your own PC in about a second.",
};

const STEPS = [
  {
    n: "01",
    title: "Buy once — $49",
    body: "Hit Buy now. One payment, no account, no subscription. Secure checkout handled by Dodo Payments.",
    accentBg: "var(--acc-coral-bg)",
    accentFg: "var(--acc-coral-fg)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2.5" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Check your inbox",
    body: "Your download link and license key arrive by email within seconds of paying.",
    accentBg: "var(--acc-green-bg)",
    accentFg: "var(--acc-green-fg)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M4 7l8 6 8-6" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Install in a click",
    body: "Run the installer — about 310 MB, works on Windows 10 & 11. No sign-in, nothing to configure.",
    accentBg: "var(--acc-indigo-bg)",
    accentFg: "var(--acc-indigo-fg)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="M7 10l5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    ),
  },
  {
    n: "04",
    title: "Remove backgrounds",
    body: "Drop an image and get a clean cutout in about a second — 100% on your device, nothing uploaded.",
    accentBg: "var(--acc-yellow-bg)",
    accentFg: "var(--acc-yellow-fg)",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen sm:px-6 sm:py-8">
      <div
        id="top"
        className="mx-auto w-full max-w-[1180px] overflow-hidden border-hairline bg-page sm:rounded-[28px] sm:border sm:shadow-[0_40px_90px_-50px_rgba(0,0,0,0.4)]"
      >
        <Nav />

        {/* Header */}
        <section className="px-[34px] pt-10 text-center sm:pt-16">
          <div className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
            How it works
          </div>
          <h1 className="mx-auto mt-[14px] max-w-[760px] font-serif text-[52px] font-normal leading-[1.02] tracking-[-0.01em] text-fg sm:text-[64px]">
            From buy to background-free in{" "}
            <span className="italic text-[var(--serif-em)]">under a minute.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-[1.55] text-body">
            No accounts, no uploads, no learning curve. Pay once, install, and
            you&apos;re cutting out backgrounds on your own machine.
          </p>
        </section>

        {/* Video */}
        <section className="px-[34px] pt-10">
          <div className="group relative mx-auto aspect-video w-full max-w-[820px] overflow-hidden rounded-[20px] border border-card-border bg-[var(--dark-card-bg)]">
            {/*
              Drop the real demo in here — either a <video src> with a poster,
              or an <iframe> embed. Placeholder shown until then.
            */}
            <div className="checkerboard absolute inset-0 opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <span className="flex size-16 items-center justify-center rounded-full bg-brand text-white shadow-[0_12px_30px_-8px_var(--brand-glow)] transition-transform group-hover:scale-105">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/80">
                Watch the 60-second demo
              </span>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="px-[34px] py-16">
          <div className="mx-auto flex max-w-[760px] flex-col gap-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex items-start gap-5 rounded-[20px] border border-card-border bg-card p-6 sm:p-7"
              >
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-[12px]"
                  style={{ background: s.accentBg, color: s.accentFg }}
                >
                  {s.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[12px] text-faint">
                      {s.n}
                    </span>
                    <h2 className="text-[18px] font-semibold text-fg">
                      {s.title}
                    </h2>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-[1.55] text-body">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Closing CTA */}
          <div className="mx-auto mt-12 flex max-w-[760px] flex-col items-center gap-4 rounded-[22px] border border-card-border bg-card px-8 py-10 text-center">
            <h3 className="font-serif text-[34px] leading-[1.05] text-fg">
              That&apos;s the whole thing.
            </h3>
            <p className="max-w-[420px] text-[15px] leading-[1.55] text-body">
              Own it forever, use it offline, and never pay a subscription
              again.
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
              <BuyButton variant="brand" size="lg" />
              <a
                href="/#pricing"
                className="text-[14px] font-medium text-body underline-offset-4 transition-colors hover:text-brand hover:underline"
              >
                See pricing →
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
