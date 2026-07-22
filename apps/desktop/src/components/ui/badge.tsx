import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/*
 * shadcn/ui Badge — restyled into the small pill vocabulary the mockups use:
 *  - chip  : format tags (JPG / PNG / WEBP) → mono, --chip-* tokens
 *  - kbd   : keyboard keys (Ctrl / O)       → mono, --kbd-* tokens
 *  - label : overlay captions (ORIGINAL / RESULT) → uppercase, --overlay
 */
const badgeVariants = cva("inline-flex items-center whitespace-nowrap", {
  variants: {
    variant: {
      chip: "font-mono text-[11px] leading-none rounded-md px-[9px] py-[3px] bg-[var(--chip-bg)] border border-[var(--chip-border)] text-[var(--chip-fg)]",
      kbd: "font-mono text-[12px] leading-none rounded-[5px] px-[7px] py-[2px] bg-[var(--kbd-bg)] border border-[var(--kbd-border)] text-[var(--kbd-fg)]",
      label:
        "font-sans text-[11px] font-semibold uppercase tracking-[0.05em] rounded-[7px] px-[10px] py-1 bg-[var(--overlay)] border border-[var(--overlay-border)] text-fg backdrop-blur-sm",
    },
  },
  defaultVariants: {
    variant: "chip",
  },
});

function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
