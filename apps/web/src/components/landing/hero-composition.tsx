"use client";

import { useEffect, useRef, useState } from "react";

function BoltIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3 6.5 7 .6-5.3 4.6 1.6 6.8L12 17.3 5.7 20.5l1.6-6.8L2 9.1l7-.6z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--green-soft-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 4v6c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function HeroComposition() {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [divider, setDivider] = useState(50);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!dragging) return;
    function move(e: PointerEvent) {
      const r = bodyRef.current?.getBoundingClientRect();
      if (!r) return;
      setDivider(Math.min(85, Math.max(15, ((e.clientX - r.left) / r.width) * 100)));
    }
    function up() {
      setDragging(false);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging]);

  return (
    <div className="relative z-[2] mx-auto mt-11 h-[500px] max-w-[1000px]">
      {/* Compare window */}
      <div className="absolute left-1/2 top-0 w-[640px] max-w-full -translate-x-1/2 overflow-hidden rounded-t-2xl border border-b-0 border-[var(--shot-border)] bg-[var(--shot-bg)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
        <div className="flex h-11 items-center border-b border-[#232323] px-[15px]">
          <div className="flex gap-[7px]">
            <span className="size-[11px] rounded-full bg-[var(--tl-red)]" />
            <span className="size-[11px] rounded-full bg-[var(--tl-yellow)]" />
            <span className="size-[11px] rounded-full bg-[var(--tl-green)]" />
          </div>
          <div className="ml-[14px] flex items-center gap-2">
            <img
              src="/icon1.png"
              alt=""
              width={15}
              height={15}
              className="size-[15px] rounded-[5px]"
            />
            <span className="text-[12.5px] font-semibold text-[#e4e4e7]">
              BackgroundGone
            </span>
          </div>
        </div>

        <div ref={bodyRef} className="relative flex h-[372px]">
          <div
            className="relative flex items-center justify-center overflow-hidden bg-[#0e0e0e] p-[26px]"
            style={{ width: `${divider}%` }}
          >
            <span className="absolute left-4 top-4 rounded-md border border-[#333] bg-black/80 px-[9px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.05em] text-[#c4c4c8]">
              Original
            </span>
            <div className="stripes h-[288px] w-[220px] shrink-0 rounded-[9px]" />
          </div>
          <div
            className="checkerboard relative flex items-center justify-center overflow-hidden p-[26px]"
            style={{ width: `${100 - divider}%` }}
          >
            <span className="absolute left-4 top-4 rounded-md border border-[#333] bg-black/80 px-[9px] py-[3px] text-[10px] font-semibold uppercase tracking-[0.05em] text-[#e4e4e7]">
              Result
            </span>
            <div className="stripes h-[288px] w-[220px] shrink-0 rounded-[9px] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.6)]" />
          </div>

          <div
            className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white"
            style={{ left: `${divider}%` }}
          >
            <button
              aria-label="Drag to compare"
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              className="absolute left-1/2 top-1/2 flex size-[34px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white text-[#18181b] shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 8l-3 4 3 4" />
                <path d="M13 8l3 4-3 4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Floating stat cards */}
      <div className="absolute left-4 top-[70px] hidden animate-bg-float1 rounded-2xl border border-[var(--float-border)] bg-[var(--float-bg)] px-[18px] py-4 shadow-[0_20px_40px_-18px_rgba(0,0,0,0.28)] lg:block">
        <div className="flex items-center gap-2.5">
          <div className="flex size-[38px] items-center justify-center rounded-[10px] bg-[#fef08a] text-[#854d0e]">
            <BoltIcon />
          </div>
          <div className="text-left">
            <div className="text-[20px] font-bold leading-none tracking-[-0.02em] text-fg">
              1.4s
            </div>
            <div className="mt-[3px] text-[11.5px] text-body">per image</div>
          </div>
        </div>
      </div>

      <div className="absolute left-[44px] top-[330px] hidden animate-bg-float3 rounded-xl bg-[var(--dark-card-bg)] px-[15px] py-[11px] shadow-[0_18px_36px_-16px_rgba(0,0,0,0.4)] lg:block">
        <div className="mb-[5px] flex gap-[3px] text-brand">
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
          <StarIcon />
        </div>
        <div className="text-[11.5px] text-[#a5a5ab]">
          Loved by <span className="font-semibold text-white">40k+</span> makers
        </div>
      </div>

      <div className="absolute right-2 top-[96px] hidden animate-bg-float2 rounded-2xl bg-[var(--green-soft-bg)] px-[18px] py-4 text-left shadow-[0_20px_40px_-18px_rgba(0,0,0,0.22)] lg:block">
        <div className="mb-[9px] flex items-center gap-2">
          <ShieldIcon />
          <span className="text-[13px] font-semibold text-[var(--green-soft-fg)]">
            Private by design
          </span>
        </div>
        <div className="text-[26px] font-bold leading-none tracking-[-0.02em] text-[var(--green-soft-fg)]">
          0 <span className="text-[14px] font-medium">uploads</span>
        </div>
        <div className="mt-[5px] text-[11.5px] text-[var(--green-soft-fg2)]">
          Files never leave your PC
        </div>
      </div>

      <div className="absolute right-[34px] top-[330px] hidden animate-bg-float4 rounded-[14px] border border-[var(--float-border)] bg-[var(--float-bg)] px-4 py-[13px] text-left shadow-[0_18px_36px_-16px_rgba(0,0,0,0.26)] lg:block">
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--faint-2)]">
          Lifetime license
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-[22px] font-bold tracking-[-0.02em] text-fg">
            $49
          </span>
          <span className="text-[12px] text-body">once · own forever</span>
        </div>
      </div>
    </div>
  );
}
