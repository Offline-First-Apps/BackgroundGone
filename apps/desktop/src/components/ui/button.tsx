import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/*
 * shadcn/ui Button — restyled to the BackgroundGone spec:
 *  - control : neutral toolbar button (Cancel, Export JPG)  → --ctrl-* tokens
 *  - brand   : primary CTA (Export PNG) → #ff6b6b, white, glow, active nudge
 *  - ghost   : subtle titlebar / start-over button
 * Heights/radii come straight from the mockup (38px controls, 9px radius,
 * 32px / 8px titlebar icon buttons).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[9px] text-[13.5px] font-medium cursor-pointer select-none transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        control:
          "border bg-[var(--ctrl-bg)] text-[var(--ctrl-fg)] border-[var(--ctrl-border)] hover:bg-[var(--ctrl-bg-hover)] hover:border-[var(--ctrl-border-hover)]",
        brand:
          "bg-brand text-white font-semibold shadow-[0_6px_18px_-6px_var(--brand-glow)] hover:bg-brand-hover active:translate-y-px",
        ghost:
          "text-icon hover:bg-[var(--icon-hover-bg)] hover:text-fg font-normal",
      },
      size: {
        default: "h-[38px] px-4",
        wide: "h-[38px] px-[18px]",
        icon: "h-[38px] w-[38px] p-0",
        chrome: "h-8 w-8 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "control",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
