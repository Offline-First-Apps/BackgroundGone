import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Shared window status bar. Height is set per-screen via className. */
export function WindowFooter({ className, ...props }: ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "flex shrink-0 items-center justify-between border-t border-edge-footer px-6",
        className,
      )}
      {...props}
    />
  );
}
