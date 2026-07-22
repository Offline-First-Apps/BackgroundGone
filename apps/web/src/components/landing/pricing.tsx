"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { WindowsIcon } from "./icons";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const pad = (n: number) => String(n).padStart(2, "0");

function useCountdown() {
  const target = useRef(Date.now() + WEEK_MS);
  const [ms, setMs] = useState(WEEK_MS);
  useEffect(() => {
    const id = setInterval(
      () => setMs(Math.max(0, target.current - Date.now())),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  const s = Math.floor(ms / 1000);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

function TimeBox({ value }: { value: number }) {
  return (
    <span className="min-w-[38px] rounded-[7px] bg-[#18181b] px-[9px] py-[5px] text-center text-[14px] font-semibold text-white">
      {pad(value)}
    </span>
  );
}

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

const CONS = [
  "Uploads to their servers",
  "Account required",
  "Stops working if you cancel",
];
const PROS = [
  "Runs 100% on your device",
  "No account, no subscription",
  "Free updates, forever",
  "30-day money-back guarantee",
];

export function Pricing() {
  const { d, h, m, s } = useCountdown();

  return (
    <section id="pricing" className="px-[34px] pb-[60px]">
      <div className="mx-auto mb-5 max-w-[560px] text-center">
        <div className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
          Pricing
        </div>
        <h2 className="mt-[14px] font-serif text-[44px] font-normal leading-[1.04] tracking-[-0.01em] text-fg">
          Buy it once. <span className="italic text-[var(--serif-em)]">Done.</span>
        </h2>
      </div>

      {/* Launch banner */}
      <div className="mx-auto mb-[26px] flex max-w-[600px] flex-wrap items-center justify-center gap-[14px] rounded-[14px] border border-[var(--badge-border)] bg-[var(--badge-bg)] px-[18px] py-3">
        <span className="text-[13.5px] font-semibold text-[var(--badge-fg)]">
          🔥 Launch price — 7 days only
        </span>
        <div className="flex items-center gap-1.5 font-mono">
          <TimeBox value={d} />
          <span className="font-semibold text-brand">d</span>
          <TimeBox value={h} />
          <span className="font-semibold text-brand">h</span>
          <TimeBox value={m} />
          <span className="font-semibold text-brand">m</span>
          <TimeBox value={s} />
          <span className="font-semibold text-brand">s</span>
        </div>
      </div>

      <div className="flex flex-wrap items-stretch justify-center gap-5">
        {/* The other guys */}
        <div className="w-[300px] rounded-[20px] border border-card-border bg-card p-[30px]">
          <div className="text-[14px] font-semibold text-body">
            The other guys
          </div>
          <div className="mt-[14px] flex items-baseline gap-1.5">
            <span className="text-[40px] font-bold tracking-[-0.02em] text-faint">
              $20
            </span>
            <span className="text-[14px] text-faint">/ month</span>
          </div>
          <div className="mt-1.5 font-mono text-[12px] text-faint">
            = $240 every year
          </div>
          <div className="my-[22px] h-px bg-hairline" />
          <div className="flex flex-col gap-3">
            {CONS.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2.5 text-[14px] text-faint"
              >
                <XIcon />
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* BackgroundGone */}
        <div className="relative w-[340px] rounded-[20px] border border-[var(--price-card-border)] bg-[var(--price-card)] p-8 text-white shadow-[0_30px_70px_-34px_rgba(0,0,0,0.55)]">
          <div className="absolute right-[22px] top-[22px] rounded-full bg-brand px-2.5 py-1 font-mono text-[10.5px] tracking-[0.06em] text-white">
            SAVE $1
          </div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-[26px] items-center justify-center rounded-[7px] bg-brand">
              <span className="size-[13px] rounded-[4px] bg-[var(--price-card)]" />
            </span>
            <span className="text-[14px] font-semibold">BackgroundGone</span>
          </div>
          <div className="mt-[18px] flex items-baseline gap-2.5">
            <span className="text-[52px] font-bold tracking-[-0.03em]">$49</span>
            <span className="text-[20px] text-[#7c7c82] line-through decoration-brand">
              $49.99
            </span>
            <span className="text-[15px] text-[#a5a5ab]">once</span>
          </div>
          <div className="mt-1.5 font-mono text-[12px] text-[#ff8b8b]">
            Launch price · ends in {d}d {h}h
          </div>
          <div className="my-[22px] h-px bg-[#2a2a2a]" />
          <div className="flex flex-col gap-3">
            {PROS.map((p) => (
              <div
                key={p}
                className="flex items-center gap-2.5 text-[14px] text-[#e4e4e7]"
              >
                <CheckIcon />
                {p}
              </div>
            ))}
          </div>
          <Button variant="brand" size="lg" className="mt-6 w-full">
            <WindowsIcon size={15} />
            Download for Windows
          </Button>
          <div className="mt-3 text-center">
            <a
              href="#"
              className="border-b border-[#3a3a3a] pb-px text-[13px] text-[#a5a5ab] transition-colors hover:text-brand"
            >
              Looking for Mac? →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
