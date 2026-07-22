import type { ComponentProps } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function ImageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.6" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

/**
 * The empty-state drop target. Purely presentational — the parent supplies
 * click/drag handlers. `dragging` forces the active (brand) treatment while a
 * file is hovering over the window.
 */
export function DropZone({
  dragging = false,
  className,
  ...props
}: ComponentProps<"div"> & { dragging?: boolean }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "flex w-[600px] max-w-full cursor-pointer flex-col items-center gap-[22px] rounded-2xl border-2 border-dashed px-10 py-14 text-center transition-[border-color,background-color] duration-200",
        dragging
          ? "border-brand bg-[var(--dz-bg-hover)]"
          : "border-[var(--dz-border)] bg-[var(--dz-bg)] hover:border-brand hover:bg-[var(--dz-bg-hover)]",
        className,
      )}
      {...props}
    >
      <div className="relative flex size-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-brand animate-bg-ring" />
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-[var(--brand-tint)] text-brand animate-bg-pulse">
          <ImageIcon />
        </div>
      </div>

      <div>
        <div className="text-[22px] font-semibold tracking-[-0.01em] text-fg">
          Drop an image here
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-fg-2">
          or press
          <Badge variant="kbd">Ctrl</Badge>
          <span className="text-fg-3">+</span>
          <Badge variant="kbd">O</Badge>
          to browse
        </div>
      </div>

      <div className="flex gap-2">
        <Badge variant="chip">JPG</Badge>
        <Badge variant="chip">PNG</Badge>
        <Badge variant="chip">WEBP</Badge>
      </div>
    </div>
  );
}
