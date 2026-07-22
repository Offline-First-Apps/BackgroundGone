import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/*
 * shadcn/ui Badge — restyled into the landing's small pills:
 *  - new  : the brand "New" tag
 *  - chip : mono format tags (PNG / JPG / WEBP)
 */
const badgeVariants = cva("inline-flex items-center whitespace-nowrap", {
  variants: {
    variant: {
      new: "rounded-full bg-brand px-2 py-[3px] font-mono text-[10.5px] font-medium uppercase tracking-[0.08em] text-white",
      chip: "rounded-md border border-border bg-page px-2 py-[3px] font-mono text-[10.5px] text-body",
    },
  },
  defaultVariants: {
    variant: "new",
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
