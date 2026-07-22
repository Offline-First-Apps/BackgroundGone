import type { ReactNode } from "react";

import { MenuButton } from "@/components/menu-button";
import { TrafficLights } from "@/components/traffic-lights";

function BrandMark() {
  return (
    <div className="flex items-center gap-[9px]">
      <div className="size-[18px] rounded-[6px] bg-brand" />
      <span className="text-[13.5px] font-semibold text-fg">BackgroundGone</span>
    </div>
  );
}

/** 48px window titlebar. `left` overrides the brand mark (e.g. "Start over"). */
export function Titlebar({ left }: { left?: ReactNode }) {
  return (
    <header
      data-tauri-drag-region
      className="flex h-12 shrink-0 items-center justify-between border-b border-edge-header px-4"
    >
      <div className="flex items-center">
        <TrafficLights />
        <div className="ml-4">{left ?? <BrandMark />}</div>
      </div>
      <MenuButton />
    </header>
  );
}
