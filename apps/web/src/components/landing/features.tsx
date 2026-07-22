import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function IconTile({
  bg,
  fg,
  children,
}: {
  bg: string;
  fg: string;
  children: ReactNode;
}) {
  return (
    <span
      className="flex size-[34px] items-center justify-center rounded-[9px]"
      style={{ background: bg, color: fg }}
    >
      {children}
    </span>
  );
}

const CompareChevrons = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 8l-3 4 3 4" />
    <path d="M13 8l3 4-3 4" />
  </svg>
);

export function Features() {
  return (
    <section id="features" className="px-[34px] pb-5 pt-[60px]">
      <div className="max-w-[620px]">
        <div className="font-mono text-[12px] font-medium uppercase tracking-[0.14em] text-brand">
          Everything you need
        </div>
        <h2 className="mt-[14px] font-serif text-[44px] font-normal leading-[1.04] tracking-[-0.01em] text-fg">
          Precise cutouts, <span className="italic text-[var(--serif-em)]">without the fuss.</span>
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Live compare slider — wide */}
        <article className="group rounded-[20px] border border-card-border bg-card p-7 transition-[border-color,box-shadow] duration-150 hover:border-border hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.25)] sm:col-span-2">
          <div className="mb-4 flex items-center gap-2.5">
            <IconTile bg="var(--acc-coral-bg)" fg="var(--acc-coral-fg)">
              {CompareChevrons}
            </IconTile>
            <span className="text-[16px] font-semibold text-fg">
              Live compare slider
            </span>
          </div>
          <p className="mb-[18px] max-w-[380px] text-[14px] leading-[1.55] text-body">
            Drag to check every edge against the original — hair, fur, glass and
            soft shadows, all handled cleanly.
          </p>
          <div className="relative flex h-[140px] overflow-hidden rounded-xl border border-hairline">
            <div className="stripes-soft flex-1" />
            <div className="checkerboard-soft flex-1" />
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
              <div className="absolute left-1/2 top-1/2 flex size-[30px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#18181b] shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 8l-3 4 3 4" />
                  <path d="M13 8l3 4-3 4" />
                </svg>
              </div>
            </div>
          </div>
        </article>

        {/* Batch */}
        <FeatureCard
          bg="var(--acc-green-bg)"
          fg="var(--acc-green-fg)"
          title="Batch a whole folder"
          desc="Drop in hundreds of images and let it work through the queue while you do something else."
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          }
        />

        {/* Formats */}
        <FeatureCard
          bg="var(--acc-yellow-bg)"
          fg="var(--acc-yellow-fg)"
          title="Transparent PNG & more"
          desc="Export to PNG, JPG or WEBP with the exact naming you want."
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16v16H4z" />
              <path d="M4 15l4-4 5 5" />
              <path d="M14 13l2-2 4 4" />
            </svg>
          }
        >
          <div className="mt-3 flex gap-1.5">
            <Badge variant="chip">PNG</Badge>
            <Badge variant="chip">JPG</Badge>
            <Badge variant="chip">WEBP</Badge>
          </div>
        </FeatureCard>

        {/* GPU — dark card */}
        <article className="rounded-[20px] bg-[var(--dark-card-bg)] p-7 text-white transition-transform duration-150 hover:-translate-y-[3px]">
          <IconTile bg="rgba(255,107,107,0.18)" fg="#ff6b6b">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
            </svg>
          </IconTile>
          <div className="mb-1.5 mt-4 text-[16px] font-semibold">
            GPU-accelerated
          </div>
          <p className="text-[14px] leading-[1.55] text-[#a5a5ab]">
            DirectML inference removes a background in about a second — no waiting
            on a server.
          </p>
        </article>

        {/* Hair-fine */}
        <FeatureCard
          bg="var(--acc-indigo-bg)"
          fg="var(--acc-indigo-fg)"
          title="Hair-fine edges"
          desc="A matting model trained on tricky edges keeps strands and soft detail intact."
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a9 9 0 1 0 9 9" />
              <path d="M12 3v9l6 3" />
            </svg>
          }
        />

        {/* Keyboard */}
        <FeatureCard
          bg="var(--acc-fuchsia-bg)"
          fg="var(--acc-fuchsia-fg)"
          title="Built for keyboard"
          desc="Drop, export and move on without touching the mouse. Shortcuts for everything."
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2.5" />
              <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
            </svg>
          }
        />
      </div>
    </section>
  );
}

function FeatureCard({
  bg,
  fg,
  icon,
  title,
  desc,
  children,
  className,
}: {
  bg: string;
  fg: string;
  icon: ReactNode;
  title: string;
  desc: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group rounded-[20px] border border-card-border bg-card p-7 transition-[border-color,box-shadow] duration-150 hover:border-border hover:shadow-[0_20px_40px_-28px_rgba(0,0,0,0.25)]",
        className,
      )}
    >
      <div className="mb-4">
        <IconTile bg={bg} fg={fg}>
          {icon}
        </IconTile>
      </div>
      <div className="mb-1.5 text-[16px] font-semibold text-fg">{title}</div>
      <p className="text-[14px] leading-[1.55] text-body">{desc}</p>
      {children}
    </article>
  );
}
