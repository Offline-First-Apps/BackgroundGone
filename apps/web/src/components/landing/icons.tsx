import type { ComponentProps } from "react";

/** Windows logo glyph, used across the CTAs. */
export function WindowsIcon({ size = 15, ...props }: { size?: number } & ComponentProps<"svg">) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 5.5l7-1v7H3zM11 4.3L21 3v9h-10zM3 12.5h7v7l-7-1zM11 12.5h10v9l-10-1.3z" />
    </svg>
  );
}
