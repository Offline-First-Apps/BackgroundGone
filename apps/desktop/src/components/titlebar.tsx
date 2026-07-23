import type { ReactNode } from "react";

import { MenuButton } from "@/components/menu-button";

function BrandMark() {
  return (
    <div className="flex items-center gap-[9px]">
      <div className="size-[18px] rounded-[6px] bg-brand" />
      <span className="text-[13.5px] font-semibold text-fg">BackgroundGone</span>
    </div>
  );
}

/** 48px app toolbar. `left` overrides the brand mark (e.g. "Start over").
 * Window controls (minimize/maximize/close) are handled by the native OS
 * titlebar, so this bar carries only the app's brand + menu. */
export function Titlebar({ left }: { left?: ReactNode }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-edge-header px-4">
      <div className="flex items-center">{left ?? <BrandMark />}</div>
      <MenuButton />
    </header>
  );
}
