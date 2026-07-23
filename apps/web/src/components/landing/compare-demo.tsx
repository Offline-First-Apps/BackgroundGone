"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Interactive before/after comparison. Drag the divider to reveal the
 * background-removed result. (Previously lived in the hero; moved to its own
 * section when the hero switched to a product video.)
 */
export function CompareDemo() {
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
    <section id="demo" className="px-[34px] py-16 text-center sm:py-20">
      <h2 className="m-0 font-serif text-[32px] font-normal leading-[1.05] tracking-[-0.01em] text-fg sm:text-[44px]">
        See the difference
      </h2>
      <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-[1.55] text-body">
        Drag the slider to compare the original against the result — clean edges,
        no halos, fully on-device.
      </p>

      {/* Compare window */}
      <div className="mx-auto mt-10 w-[640px] max-w-full overflow-hidden rounded-2xl border border-[var(--shot-border)] bg-[var(--shot-bg)] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)]">
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
    </section>
  );
}
