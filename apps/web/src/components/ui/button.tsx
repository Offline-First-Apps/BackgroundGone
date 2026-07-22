import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/*
 * shadcn/ui Button — restyled to the landing's CTA vocabulary:
 *  - brand     : #ff6b6b primary CTA (Download for Windows)
 *  - secondary : outline button (See how it works), theme-aware --secbtn-*
 *  - nav       : the pill "Get for Windows" (neutral in light, brand in dark)
 * Sizes map to the exact heights/radii in the mockup.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold cursor-pointer select-none transition-[background-color,border-color,color,transform] duration-150 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        brand: "bg-brand text-white hover:bg-brand-hover active:translate-y-px",
        secondary:
          "border bg-[var(--secbtn-bg)] border-[var(--secbtn-border)] text-[var(--secbtn-fg)] hover:bg-[var(--secbtn-hover-bg)] hover:border-[var(--secbtn-hover-border)]",
        nav: "bg-[var(--getbtn-bg)] text-white hover:bg-[var(--getbtn-hover)]",
      },
      size: {
        nav: "h-10 gap-2 rounded-full px-5 text-[13.5px]",
        md: "h-[46px] gap-[9px] rounded-xl px-[22px] text-[14.5px]",
        lg: "h-12 gap-[9px] rounded-xl px-6 text-[15px]",
        xl: "h-[50px] gap-[9px] rounded-xl px-[26px] text-[15px]",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "lg",
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
